import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

/**
 * Get account statistics
 */
export const getStats = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const profile = await prisma.clientProfile.findUnique({
      where: { id: req.user.profile.id },
      select: {
        createdAt: true,
        user: {
          select: {
            createdAt: true,
          },
        },
      },
    });

    // Get case statistics
    const [
      totalCases,
      activeCases,
      completedCases,
      cancelledCases,
      totalPayments,
      verifiedPayments,
    ] = await Promise.all([
      // Total cases
      prisma.case.count({
        where: {
          clientProfileId: req.user.profile.id,
          deletedAt: null,
        },
      }),

      // Active cases (not completed, cancelled, or refunded)
      prisma.case.count({
        where: {
          clientProfileId: req.user.profile.id,
          deletedAt: null,
          status: {
            notIn: ["completed", "cancelled", "refunded"],
          },
        },
      }),

      // Completed cases
      prisma.case.count({
        where: {
          clientProfileId: req.user.profile.id,
          deletedAt: null,
          status: "completed",
        },
      }),

      // Cancelled cases
      prisma.case.count({
        where: {
          clientProfileId: req.user.profile.id,
          deletedAt: null,
          status: {
            in: ["cancelled", "refunded"],
          },
        },
      }),

      // Total payments
      prisma.payment.findMany({
        where: {
          clientProfileId: req.user.profile.id,
          deletedAt: null,
        },
        select: {
          amount: true,
          status: true,
        },
      }),

      // Verified payments only
      prisma.payment.findMany({
        where: {
          clientProfileId: req.user.profile.id,
          deletedAt: null,
          status: "verified",
        },
        select: {
          amount: true,
        },
      }),
    ]);

    // Calculate spending
    const totalSpent = verifiedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const pendingPayments = totalPayments.filter((p) => p.status === "pending").length;

    // Get case status breakdown
    const casesByStatus = await prisma.case.groupBy({
      by: ["status"],
      where: {
        clientProfileId: req.user.profile.id,
        deletedAt: null,
      },
      _count: true,
    });

    const statusBreakdown = {};
    casesByStatus.forEach((item) => {
      statusBreakdown[item.status] = item._count;
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCases = await prisma.case.count({
      where: {
        clientProfileId: req.user.profile.id,
        deletedAt: null,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    logger.info("Stats retrieved", {
      userId: req.user.id,
      totalCases,
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCases,
          activeCases,
          completedCases,
          cancelledCases,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          currency: "SAR",
          memberSince: profile.user.createdAt,
        },
        payments: {
          totalPayments: totalPayments.length,
          verifiedPayments: verifiedPayments.length,
          pendingPayments,
        },
        activity: {
          recentCases, // Last 30 days
        },
        breakdown: {
          byStatus: statusBreakdown,
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getStats",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to get statistics",
    });
  }
};

/**
 * Get detailed payment history
 */
export const getPaymentHistory = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { year, month } = req.query;

    const where = {
      clientProfileId: req.user.profile.id,
      deletedAt: null,
      status: "verified",
    };

    // Filter by year/month if provided
    if (year) {
      const startDate = new Date(parseInt(year), month ? parseInt(month) - 1 : 0, 1);
      const endDate = month
        ? new Date(parseInt(year), parseInt(month), 1)
        : new Date(parseInt(year) + 1, 0, 1);

      where.verifiedAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      select: {
        id: true,
        paymentNumber: true,
        amount: true,
        paymentType: true,
        verifiedAt: true,
        case: {
          select: {
            id: true,
            caseNumber: true,
          },
        },
      },
      orderBy: {
        verifiedAt: "desc",
      },
    });

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    logger.info("Payment history retrieved", {
      userId: req.user.id,
      count: payments.length,
      year,
      month,
    });

    res.status(200).json({
      success: true,
      data: {
        payments,
        summary: {
          totalPayments: payments.length,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          currency: "SAR",
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getPaymentHistory",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to get payment history",
    });
  }
};
