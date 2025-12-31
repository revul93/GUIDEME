import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

/**
 * List all clients (Admin only)
 * With pagination, search, and filters
 */
export const listAllClients = async (req, res) => {
  try {
    // Only admins can list clients
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view client list",
      });
    }

    const {
      page = 1,
      limit = 20,
      search,
      clientType,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {
      deletedAt: null,
    };

    // Filter by client type
    if (clientType && ["doctor", "lab"].includes(clientType)) {
      whereClause.clientType = clientType;
    }

    // Search by name, email, or phone
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phoneNumber: { contains: search } } },
        { clinicName: { contains: search, mode: "insensitive" } },
        { labName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.clientProfile.count({ where: whereClause });

    // Get clients with related data
    const clients = await prisma.clientProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
            accountStatus: true,
            emailVerified: true,
            phoneVerified: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        _count: {
          select: {
            cases: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum,
    });

    // Get spending for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const [totalSpent, caseStats] = await Promise.all([
          prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
              case: { clientProfileId: client.id },
              status: "verified",
            },
          }),
          prisma.case.groupBy({
            by: ["status"],
            _count: true,
            where: { clientProfileId: client.id },
          }),
        ]);

        const statusBreakdown = {};
        caseStats.forEach((stat) => {
          statusBreakdown[stat.status] = stat._count;
        });

        return {
          id: client.id,
          name: client.name,
          clientType: client.clientType,
          email: client.user.email,
          phoneNumber: client.user.phoneNumber,
          specialty: client.specialty,
          clinicName: client.clinicName,
          labName: client.labName,
          accountStatus: client.user.accountStatus,
          emailVerified: client.user.emailVerified,
          phoneVerified: client.user.phoneVerified,
          totalCases: client._count.cases,
          casesByStatus: statusBreakdown,
          totalSpent: totalSpent._sum.amount || 0,
          registeredAt: client.user.createdAt,
          lastLogin: client.user.lastLoginAt,
        };
      })
    );

    logger.info("Clients list accessed", {
      adminId: req.user.id,
      count: clients.length,
      total,
    });

    res.json({
      success: true,
      data: {
        clients: clientsWithStats,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "listAllClients",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
    });
  }
};

/**
 * Get client details (Admin only)
 * Full profile with all contact info and case history
 */
export const getClientDetails = async (req, res) => {
  try {
    // Only admins can view full client details
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view client details",
      });
    }

    const { id } = req.params;
    const clientProfileId = parseInt(id);

    // Get client with full details
    const client = await prisma.clientProfile.findFirst({
      where: {
        id: clientProfileId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
            accountStatus: true,
            emailVerified: true,
            phoneVerified: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        deliveryAddresses: {
          where: { deletedAt: null },
        },
        cases: {
          include: {
            quotes: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: {
            cases: true,
            deliveryAddresses: true,
          },
        },
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Get financial statistics
    const [paymentStats, totalSpent, avgCaseValue] = await Promise.all([
      prisma.payment.groupBy({
        by: ["status"],
        _sum: { amount: true },
        _count: true,
        where: {
          case: { clientProfileId },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          case: { clientProfileId },
          status: "verified",
        },
      }),
      prisma.caseQuote.aggregate({
        _avg: { totalAmount: true },
        where: {
          case: { clientProfileId },
          isAccepted: true,
        },
      }),
    ]);

    const paymentBreakdown = {};
    paymentStats.forEach((stat) => {
      paymentBreakdown[stat.status] = {
        count: stat._count,
        total: stat._sum.amount || 0,
      };
    });

    logger.info("Client details accessed", {
      adminId: req.user.id,
      clientId: clientProfileId,
    });

    res.json({
      success: true,
      data: {
        client: {
          id: client.id,
          name: client.name,
          clientType: client.clientType,
          email: client.user.email,
          phoneNumber: client.user.phoneNumber,
          specialty: client.specialty,
          specialtyOther: client.specialtyOther,
          clinicName: client.clinicName,
          labName: client.labName,
          accountStatus: client.user.accountStatus,
          emailVerified: client.user.emailVerified,
          phoneVerified: client.user.phoneVerified,
          registeredAt: client.user.createdAt,
          lastLogin: client.user.lastLoginAt,
        },
        statistics: {
          totalCases: client._count.cases,
          totalSpent: totalSpent._sum.amount || 0,
          avgCaseValue: avgCaseValue._avg.totalAmount || 0,
          paymentBreakdown,
        },
        deliveryAddresses: client.deliveryAddresses.map((addr) => ({
          id: addr.id,
          fullName: addr.fullName,
          phoneNumber: addr.phoneNumber,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          isDefault: addr.isDefault,
        })),
        recentCases: client.cases.map((c) => ({
          id: c.id,
          caseNumber: c.caseNumber,
          status: c.status,
          patientName: c.patientName,
          toothNumbers: c.toothNumbers,
          latestQuote: c.quotes[0]
            ? {
                id: c.quotes[0].id,
                totalAmount: c.quotes[0].totalAmount,
                isAccepted: c.quotes[0].isAccepted,
              }
            : null,
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getClientDetails",
      userId: req.user?.id,
      clientId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch client details",
    });
  }
};

/**
 * List all designers (Admin only)
 */
export const listAllDesigners = async (req, res) => {
  try {
    // Only admins can list designers
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view designer list",
      });
    }

    const {
      page = 1,
      limit = 20,
      search,
      isAdmin,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {
      deletedAt: null,
    };

    // Filter by admin status
    if (isAdmin !== undefined) {
      whereClause.isAdmin = isAdmin === "true";
    }

    // Search by name or email
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { specialization: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.designerProfile.count({ where: whereClause });

    // Get designers with stats
    const designers = await prisma.designerProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
            accountStatus: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        _count: {
          select: {
            studiesCompleted: true,
            quotesCreated: true,
            paymentsVerified: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum,
    });

    logger.info("Designers list accessed", {
      adminId: req.user.id,
      count: designers.length,
      total,
    });

    res.json({
      success: true,
      data: {
        designers: designers.map((d) => ({
          id: d.id,
          name: d.name,
          email: d.user.email,
          phoneNumber: d.user.phoneNumber,
          specialization: d.specialization,
          experienceYears: d.experienceYears,
          bio: d.bio,
          isAdmin: d.isAdmin,
          accountStatus: d.user.accountStatus,
          studiesCompleted: d._count.studiesCompleted,
          quotesCreated: d._count.quotesCreated,
          paymentsVerified: d._count.paymentsVerified,
          joinedAt: d.user.createdAt,
          lastLogin: d.user.lastLoginAt,
        })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "listAllDesigners",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch designers",
    });
  }
};

/**
 * Update user account status (Admin only)
 * Activate, suspend, or ban accounts
 */
export const updateAccountStatus = async (req, res) => {
  try {
    // Only admins can update account status
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update account status",
      });
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    const userId = parseInt(id);

    // Validate status
    if (!["active", "suspended", "banned"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'active', 'suspended', or 'banned'",
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: true,
        designerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent suspending/banning yourself
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    // Prevent suspending/banning the last admin
    if (
      user.designerProfile?.isAdmin &&
      (status === "suspended" || status === "banned")
    ) {
      const adminCount = await prisma.designerProfile.count({
        where: {
          isAdmin: true,
          deletedAt: null,
          user: {
            accountStatus: "active",
          },
        },
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot suspend/ban the last admin in the system",
        });
      }
    }

    // Update account status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: status },
    });

    // Log the action
    logger.warn("Account status changed", {
      targetUserId: userId,
      targetEmail: user.email,
      newStatus: status,
      reason,
      changedBy: req.user.id,
      changedByName: req.user.profile.name,
    });

    res.json({
      success: true,
      message: `Account ${status} successfully`,
      data: {
        userId: updatedUser.id,
        email: updatedUser.email,
        accountStatus: updatedUser.accountStatus,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateAccountStatus",
      userId: req.user?.id,
      targetUserId: req.params?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to update account status",
    });
  }
};
