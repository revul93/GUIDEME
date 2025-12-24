import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const viewClientProfile = async (req, res) => {
  try {
    if (req.user.role !== "designer") {
      return res.status(403).json({
        success: false,
        message: "Only designers can access this endpoint",
      });
    }

    const { id } = req.params;

    const isAdmin = req.user.designerProfile?.isAdmin;

    const profile = await prisma.clientProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            email: isAdmin, // Only admin can see email
            phoneNumber: isAdmin, // Only admin can see phone
            emailVerified: isAdmin,
            phoneVerified: isAdmin,
            accountStatus: true,
            createdAt: true,
            lastLoginAt: isAdmin,
          },
        },
        addresses: isAdmin
          ? {
              orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
            }
          : false, // Only admin can see addresses
        _count: {
          select: {
            cases: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found",
      });
    }

    const responseData = {
      profile: {
        id: profile.id,
        clientType: profile.clientType,
        name: profile.name,
        specialty: profile.specialty,
        specialtyOther: profile.specialtyOther,
        clinicName: profile.clinicName,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
      user: profile.user,
      casesCount: profile._count.cases,
    };

    if (isAdmin && profile.addresses) {
      responseData.addresses = profile.addresses;
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "viewClientProfile",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to view client profile",
    });
  }
};

export const listClients = async (req, res) => {
  try {
    if (req.user.role !== "designer") {
      return res.status(403).json({
        success: false,
        message: "Only designers can access this endpoint",
      });
    }

    const {
      clientType,
      specialty,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const where = {};

    if (clientType) {
      where.clientType = clientType;
    }

    if (specialty) {
      where.specialty = specialty;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const isAdmin = req.user.designerProfile?.isAdmin;

    const [clients, total] = await Promise.all([
      prisma.clientProfile.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              email: isAdmin, // Only admin sees email
              phoneNumber: isAdmin, // Only admin sees phone
              accountStatus: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              cases: true,
            },
          },
        },
      }),
      prisma.clientProfile.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        clients,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "listClients",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to list clients",
    });
  }
};
