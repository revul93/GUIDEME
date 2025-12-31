import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

/**
 * Get pending payment verifications (Admin only)
 * Queue of payments waiting for admin verification
 */
export const getPendingVerifications = async (req, res) => {
  try {
    // Only admins can view pending verifications
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view pending verifications",
      });
    }

    const {
      page = 1,
      limit = 20,
      paymentType,
      sortBy = "createdAt",
      sortOrder = "asc", // Oldest first for queue
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {
      status: "pending",
    };

    // Filter by payment type
    if (paymentType && ["study", "production"].includes(paymentType)) {
      whereClause.paymentType = paymentType;
    }

    // Get total count
    const total = await prisma.payment.count({ where: whereClause });

    // Get pending payments with case details
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        case: {
          include: {
            clientProfile: {
              select: {
                id: true,
                name: true,
                clientType: true,
              },
            },
            quotes: {
              where: { isAccepted: true },
              take: 1,
              orderBy: { acceptedAt: "desc" },
            },
          },
        },
        uploadedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum,
    });

    // Calculate priority for each payment
    const paymentsWithPriority = payments.map((payment) => {
      const daysPending = Math.floor(
        (new Date() - new Date(payment.createdAt)) / (1000 * 60 * 60 * 24)
      );

      let priority = "normal";
      if (daysPending > 7) {
        priority = "urgent";
      } else if (daysPending > 3) {
        priority = "high";
      }

      return {
        id: payment.id,
        amount: payment.amount,
        paymentType: payment.paymentType,
        paymentMethod: payment.paymentMethod,
        case: {
          id: payment.case.id,
          caseNumber: payment.case.caseNumber,
          client: payment.case.clientProfile.name,
          clientType: payment.case.clientProfile.clientType,
          status: payment.case.status,
        },
        receiptUrl: payment.receiptUrl,
        uploadedBy: payment.uploadedBy.name,
        uploadedAt: payment.createdAt,
        daysPending,
        priority,
        expectedAmount:
          payment.paymentType === "study"
            ? 100
            : payment.case.quotes[0]?.totalAmount || null,
      };
    });

    // Get summary stats
    const [studyCount, productionCount, totalPendingAmount] = await Promise.all(
      [
        prisma.payment.count({
          where: { status: "pending", paymentType: "study" },
        }),
        prisma.payment.count({
          where: { status: "pending", paymentType: "production" },
        }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: "pending" },
        }),
      ]
    );

    logger.info("Pending verifications queue accessed", {
      adminId: req.user.id,
      count: payments.length,
      total,
    });

    res.json({
      success: true,
      data: {
        payments: paymentsWithPriority,
        summary: {
          total,
          studyPayments: studyCount,
          productionPayments: productionCount,
          totalAmount: totalPendingAmount._sum.amount || 0,
        },
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
      controller: "getPendingVerifications",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending verifications",
    });
  }
};

/**
 * Get revenue report (Admin only)
 * Financial analytics and revenue breakdown
 */
export const getRevenueReport = async (req, res) => {
  try {
    // Only admins can view revenue reports
    if (req.user.role !== "designer" || !req.user.profile.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view revenue reports",
      });
    }

    const { startDate, endDate, groupBy = "month" } = req.query;

    // Default to current month if no dates provided
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Validate date range
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    // Get all verified payments in date range
    const payments = await prisma.payment.findMany({
      where: {
        status: "verified",
        verifiedAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        case: {
          include: {
            clientProfile: {
              select: {
                clientType: true,
              },
            },
            quotes: {
              where: { isAccepted: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { verifiedAt: "asc" },
    });

    // Calculate totals
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const studyRevenue = payments
      .filter((p) => p.paymentType === "study")
      .reduce((sum, p) => sum + p.amount, 0);
    const productionRevenue = payments
      .filter((p) => p.paymentType === "production")
      .reduce((sum, p) => sum + p.amount, 0);

    // Revenue by client type
    const doctorRevenue = payments
      .filter((p) => p.case.clientProfile.clientType === "doctor")
      .reduce((sum, p) => sum + p.amount, 0);
    const labRevenue = payments
      .filter((p) => p.case.clientProfile.clientType === "lab")
      .reduce((sum, p) => sum + p.amount, 0);

    // Revenue by payment method
    const revenueByMethod = payments.reduce((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
      return acc;
    }, {});

    // Group by time period
    const revenueTimeline = {};
    payments.forEach((payment) => {
      const date = new Date(payment.verifiedAt);
      let key;

      if (groupBy === "day") {
        key = date.toISOString().split("T")[0];
      } else if (groupBy === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!revenueTimeline[key]) {
        revenueTimeline[key] = {
          period: key,
          total: 0,
          study: 0,
          production: 0,
          count: 0,
        };
      }

      revenueTimeline[key].total += payment.amount;
      revenueTimeline[key].count += 1;
      if (payment.paymentType === "study") {
        revenueTimeline[key].study += payment.amount;
      } else {
        revenueTimeline[key].production += payment.amount;
      }
    });

    // Calculate average order value
    const productionPayments = payments.filter(
      (p) => p.paymentType === "production"
    );
    const avgOrderValue =
      productionPayments.length > 0
        ? productionRevenue / productionPayments.length
        : 0;

    // Get discount impact
    const discountGiven = await prisma.discountUsage
      .aggregate({
        _sum: { discountAmount: true },
        where: {
          appliedAt: {
            gte: start,
            lte: end,
          },
        },
      })
      .catch(() => ({ _sum: { discountAmount: 0 } })); // If discount feature not implemented

    logger.info("Revenue report accessed", {
      adminId: req.user.id,
      startDate: start,
      endDate: end,
      totalRevenue,
    });

    res.json({
      success: true,
      data: {
        period: {
          start: start.toISOString().split("T")[0],
          end: end.toISOString().split("T")[0],
          days: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
        },
        summary: {
          totalRevenue,
          studyRevenue,
          productionRevenue,
          totalPayments: payments.length,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          discountGiven: discountGiven._sum.discountAmount || 0,
        },
        breakdown: {
          byPaymentType: {
            study: studyRevenue,
            production: productionRevenue,
          },
          byClientType: {
            doctor: doctorRevenue,
            lab: labRevenue,
          },
          byPaymentMethod: revenueByMethod,
        },
        timeline: Object.values(revenueTimeline).sort(
          (a, b) => a.period.localeCompare(b.period)
        ),
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getRevenueReport",
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to generate revenue report",
    });
  }
};
