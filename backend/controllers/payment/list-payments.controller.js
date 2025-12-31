import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const listPayments = async (req, res) => {
  try {
    const { caseId, status, paymentType, page = 1, limit = 10 } = req.query;

    const where = {
      deletedAt: null, // FIXED: Add soft delete check
    };

    if (req.user.role === "client") {
      where.clientProfileId = req.user.profile.id;
    }

    if (caseId) {
      where.caseId = parseInt(caseId);
    }

    if (status) {
      where.status = status;
    }

    if (paymentType) {
      where.paymentType = paymentType;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              status: true,
            },
          },
          clientProfile: {
            select: {
              id: true,
              name: true,
            },
          },
          quote: {
            select: {
              id: true,
              quoteNumber: true,
              totalAmount: true,
            },
          },
          verifiedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    logger.info("Payments listed", {
      count: payments.length,
      total,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: {
        payments,
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
      controller: "listPayments",
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to list payments",
    });
  }
};

export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        case: {
          include: {
            clientProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        clientProfile: {
          select: {
            id: true,
            name: true,
          },
        },
        quote: true,
        verifiedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!payment || payment.deletedAt) {
      // FIXED: Add soft delete check
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (req.user.role === "client") {
      if (payment.clientProfileId !== req.user.profile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        payment,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getPayment",
      userId: req.user?.id,
      paymentId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to get payment details",
    });
  }
};
