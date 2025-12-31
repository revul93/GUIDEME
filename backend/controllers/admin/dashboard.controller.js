import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

/**
 * Get admin dashboard statistics
 * Shows overview of platform activity
 */
export const getDashboard = async (req, res) => {
  try {
    // Only admins can access dashboard
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can access dashboard",
      });
    }

    // Get date ranges
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel queries for performance
    const [
      // Cases statistics
      totalCases,
      todayCases,
      monthCases,
      casesByStatus,

      // Payment statistics
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      pendingPayments,
      verifiedPaymentsCount,

      // User statistics
      totalClients,
      totalDesigners,
      totalAdmins,
      newClientsThisMonth,

      // Quote statistics
      pendingQuotes,
      acceptedQuotesThisMonth,
      totalQuotes,

      // Recent activity
      recentCases,
      recentPayments,
    ] = await Promise.all([
      // Cases
      prisma.case.count({
        where: { deletedAt: null },
      }),
      prisma.case.count({
        where: {
          createdAt: { gte: startOfToday },
          deletedAt: null,
        },
      }),
      prisma.case.count({
        where: {
          createdAt: { gte: startOfMonth },
          deletedAt: null,
        },
      }),
      prisma.case.groupBy({
        by: ["status"],
        _count: true,
        where: { deletedAt: null },
      }),

      // Payments
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "verified",
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "verified",
          verifiedAt: { gte: startOfMonth },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "verified",
          verifiedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.payment.count({
        where: { status: "pending" },
      }),
      prisma.payment.count({
        where: { status: "verified" },
      }),

      // Users
      prisma.clientProfile.count({
        where: { deletedAt: null },
      }),
      prisma.designerProfile.count({
        where: {
          deletedAt: null,
          isAdmin: false,
        },
      }),
      prisma.designerProfile.count({
        where: {
          deletedAt: null,
          isAdmin: true,
        },
      }),
      prisma.clientProfile.count({
        where: {
          createdAt: { gte: startOfMonth },
          deletedAt: null,
        },
      }),

      // Quotes
      prisma.caseQuote.count({
        where: {
          isSent: true,
          isAccepted: false,
          isRejected: false,
        },
      }),
      prisma.caseQuote.count({
        where: {
          isAccepted: true,
          acceptedAt: { gte: startOfMonth },
        },
      }),
      prisma.caseQuote.count(),

      // Recent activity
      prisma.case.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          clientProfile: {
            select: { name: true, clientType: true },
          },
        },
        where: { deletedAt: null },
      }),
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          case: {
            include: {
              clientProfile: {
                select: { name: true },
              },
            },
          },
        },
      }),
    ]);

    // Calculate growth percentages
    const revenueGrowth =
      lastMonthRevenue._sum.amount > 0
        ? ((monthRevenue._sum.amount - lastMonthRevenue._sum.amount) /
            lastMonthRevenue._sum.amount) *
          100
        : 0;

    // Format case status data
    const statusBreakdown = {};
    casesByStatus.forEach((item) => {
      statusBreakdown[item.status] = item._count;
    });

    logger.info("Dashboard accessed", {
      adminId: req.user.id,
      adminName: req.user.profile.name,
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalCases,
          todayCases,
          monthCases,
          totalRevenue: totalRevenue._sum.amount || 0,
          monthRevenue: monthRevenue._sum.amount || 0,
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          pendingPayments,
          verifiedPayments: verifiedPaymentsCount,
          totalClients,
          totalDesigners,
          totalAdmins,
          newClientsThisMonth,
          pendingQuotes,
          acceptedQuotesThisMonth,
          totalQuotes,
        },
        casesByStatus: statusBreakdown,
        recentActivity: {
          cases: recentCases.map((c) => ({
            id: c.id,
            caseNumber: c.caseNumber,
            client: c.clientProfile.name,
            clientType: c.clientProfile.clientType,
            status: c.status,
            createdAt: c.createdAt,
          })),
          payments: recentPayments.map((p) => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            type: p.paymentType,
            client: p.case.clientProfile.name,
            createdAt: p.createdAt,
          })),
        },
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getDashboard",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

/**
 * Get system statistics (more detailed than dashboard)
 */
export const getSystemStats = async (req, res) => {
  try {
    // Only admins can access stats
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can access system statistics",
      });
    }

    const { period = "30" } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [
      // Platform metrics
      platformMetrics,

      // Designer performance
      designerStats,

      // Client activity
      clientStats,

      // Case metrics
      caseMetrics,

      // Revenue breakdown
      revenueByType,

      // Discount usage
      discountStats,
    ] = await Promise.all([
      // Platform metrics
      prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT c.id) as total_cases,
          COUNT(DISTINCT cp.id) as total_clients,
          COUNT(DISTINCT dp.id) as total_designers,
          AVG(cq."totalAmount") as avg_quote_value
        FROM "Case" c
        LEFT JOIN "ClientProfile" cp ON c."clientProfileId" = cp.id
        LEFT JOIN "DesignerProfile" dp ON dp."deletedAt" IS NULL
        LEFT JOIN "CaseQuote" cq ON c.id = cq."caseId"
        WHERE c."deletedAt" IS NULL
      `,

      // Designer performance
      prisma.designerProfile.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              studiesCompleted: true,
              quotesCreated: true,
            },
          },
        },
        orderBy: {
          studiesCompleted: {
            _count: "desc",
          },
        },
        take: 10,
      }),

      // Client statistics
      prisma.clientProfile.groupBy({
        by: ["clientType"],
        _count: true,
        where: { deletedAt: null },
      }),

      // Case metrics
      prisma.case.groupBy({
        by: ["status"],
        _count: true,
        _avg: {
          id: true,
        },
        where: {
          createdAt: { gte: daysAgo },
          deletedAt: null,
        },
      }),

      // Revenue by payment type
      prisma.payment.groupBy({
        by: ["paymentType"],
        _sum: {
          amount: true,
        },
        _count: true,
        where: {
          status: "verified",
          verifiedAt: { gte: daysAgo },
        },
      }),

      // Discount statistics
      prisma.discountCode
        .count({
          where: {
            deletedAt: null,
            isActive: true,
          },
        })
        .catch(() => 0), // If discount feature not yet implemented
    ]);

    logger.info("System stats accessed", {
      adminId: req.user.id,
      period,
    });

    res.json({
      success: true,
      data: {
        period: parseInt(period),
        platform: platformMetrics[0] || {},
        topDesigners: designerStats.map((d) => ({
          id: d.id,
          name: d.name,
          studiesCompleted: d._count.studiesCompleted,
          quotesCreated: d._count.quotesCreated,
        })),
        clientsByType: clientStats.reduce((acc, item) => {
          acc[item.clientType] = item._count;
          return acc;
        }, {}),
        caseMetrics: caseMetrics.map((m) => ({
          status: m.status,
          count: m._count,
        })),
        revenueByType: revenueByType.map((r) => ({
          type: r.paymentType,
          total: r._sum.amount || 0,
          count: r._count,
        })),
        activeDiscountCodes: discountStats,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getSystemStats",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch system statistics",
    });
  }
};
