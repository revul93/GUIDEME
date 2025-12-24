import prisma from "../../config/db.js";
import logger from "../../utils/logger.js";

const MAX_ADDRESSES = 5;

export const listAddresses = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const addresses = await prisma.address.findMany({
      where: { clientProfileId: req.user.profile.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    res.status(200).json({
      success: true,
      data: { addresses },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "listAddresses",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to list addresses",
    });
  }
};

export const addAddress = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const {
      label,
      country,
      city,
      district,
      street,
      building,
      postalCode,
      latitude,
      longitude,
      placeId,
      isDefault,
    } = req.body;

    const addressCount = await prisma.address.count({
      where: { clientProfileId: req.user.profile.id },
    });

    if (addressCount >= MAX_ADDRESSES) {
      return res.status(400).json({
        success: false,
        message: `You can only have up to ${MAX_ADDRESSES} addresses`,
      });
    }

    if (!city || !street) {
      return res.status(400).json({
        success: false,
        message: "City and street are required",
      });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { clientProfileId: req.user.profile.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        clientProfileId: req.user.profile.id,
        label,
        country: country || "Saudi Arabia",
        city,
        district,
        street,
        building,
        postalCode,
        latitude,
        longitude,
        placeId,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: { address },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "addaddress",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { id } = req.params;
    const {
      label,
      country,
      city,
      district,
      street,
      building,
      postalCode,
      latitude,
      longitude,
      placeId,
      isDefault,
    } = req.body;

    const address = await prisma.address.findFirst({
      where: {
        id: parseInt(id),
        clientProfileId: req.user.profile.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { clientProfileId: req.user.profile.id },
        data: { isDefault: false },
      });
    }

    const updateData = {};
    if (label !== undefined) updateData.label = label;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (district !== undefined) updateData.district = district;
    if (street !== undefined) updateData.street = street;
    if (building !== undefined) updateData.building = building;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (placeId !== undefined) updateData.placeId = placeId;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const updatedAddress = await prisma.address.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: { address: updatedAddress },
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "updateAddress",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: {
        id: parseInt(id),
        clientProfileId: req.user.profile.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await prisma.address.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "deleteAddress",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can access this endpoint",
      });
    }

    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: {
        id: parseInt(id),
        clientProfileId: req.user.profile.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await prisma.address.updateMany({
      where: { clientProfileId: req.user.profile.id },
      data: { isDefault: false },
    });

    await prisma.address.update({
      where: { id: parseInt(id) },
      data: { isDefault: true },
    });

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
    });
  } catch (error) {
    logger.error("Controller error:", {
      error: error.message,
      stack: error.stack,
      controller: "setDefaultAddress",
      userId: req.user?.id,
      caseId: req.params?.id,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
};
