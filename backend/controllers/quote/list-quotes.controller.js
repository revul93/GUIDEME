import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

export const listQuotes = async (req, res) => {
  try {
    const { id } = req.params;

    const caseData = await prisma.case.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        clientProfileId: true,
        deletedAt: true,
      },
    });

    if (!caseData || caseData.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (req.user.role === "client") {
      if (caseData.clientProfileId !== req.user.profile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    const quotes = await prisma.caseQuote.findMany({
      where: {
        caseId: parseInt(id),
        deletedAt: null, // FIXED: Add soft delete check
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    logger.info("Quotes listed", {
      caseId: parseInt(id),
      count: quotes.length,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: {
        quotes,
        total: quotes.length,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "listQuotes",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to list quotes",
    });
  }
};

export const getQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await prisma.caseQuote.findUnique({
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
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: {
          where: {
            deletedAt: null, // FIXED: Add soft delete check for payments
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!quote || quote.deletedAt) {
      // FIXED: Add soft delete check
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    if (req.user.role === "client") {
      if (quote.case.clientProfileId !== req.user.profile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        quote,
      },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "getQuote",
      userId: req.user?.id,
      quoteId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to get quote",
    });
  }
};
