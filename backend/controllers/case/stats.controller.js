import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const getCaseStats = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access statistics",
      });
    }

    const clientProfileId = req.user.profile.id;

    // Get counts by status groups
    const [total, pending, active, delivered, cancelled] = await Promise.all([
      // Total cases
      prisma.case.count({
        where: { clientProfileId },
      }),

      // Pending (awaiting action/payment)
      prisma.case.count({
        where: {
          clientProfileId,
          status: {
            in: [
              "pending_study_payment_verification",
              "submitted",
              "quote_pending",
              "quote_sent",
              "pending_production_payment_verification",
            ],
          },
        },
      }),

      // Active (work in progress)
      prisma.case.count({
        where: {
          clientProfileId,
          status: {
            in: [
              "study_in_progress",
              "study_completed",
              "quote_accepted",
              "in_production",
              "pending_response",
              "production_completed",
              "ready_for_pickup",
              "out_for_delivery",
            ],
          },
        },
      }),

      // Delivered/Completed
      prisma.case.count({
        where: {
          clientProfileId,
          status: {
            in: ["delivered", "completed"],
          },
        },
      }),

      // Cancelled/Refunded
      prisma.case.count({
        where: {
          clientProfileId,
          status: {
            in: ["cancelled", "quote_rejected", "refund_requested", "refunded"],
          },
        },
      }),
    ]);

    // Recent cases (last 5)
    const recentCases = await prisma.case.findMany({
      where: { clientProfileId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        caseNumber: true,
        status: true,
        procedureCategory: true,
        createdAt: true,
        submittedAt: true,
      },
    });

    // Get status breakdown
    const statusBreakdown = await prisma.case.groupBy({
      by: ["status"],
      where: { clientProfileId },
      _count: {
        status: true,
      },
    });

    // Get procedure category breakdown
    const procedureBreakdown = await prisma.case.groupBy({
      by: ["procedureCategory"],
      where: { clientProfileId },
      _count: {
        procedureCategory: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total,
          pending,
          active,
          delivered,
          cancelled,
        },
        recentCases,
        statusBreakdown: statusBreakdown.map((item) => ({
          status: item.status,
          count: item._count.status,
        })),
        procedureBreakdown: procedureBreakdown.map((item) => ({
          category: item.procedureCategory,
          count: item._count.procedureCategory,
        })),
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getCaseStats",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to get statistics",
    });
  }
};
