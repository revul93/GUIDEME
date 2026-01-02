/**
 * Status Transition Helper
 * Client-side validation and workflow management for case statuses
 */

import { CASE_STATUS } from "./constants";

// Complete status transition matrix from backend
const STATUS_TRANSITIONS = {
  // Initial states
  [CASE_STATUS.SUBMITTED]: {
    client: [CASE_STATUS.CANCELLED],
    designer: [
      CASE_STATUS.STUDY_IN_PROGRESS,
      CASE_STATUS.PENDING_STUDY_PAYMENT_VERIFICATION,
      CASE_STATUS.CANCELLED,
    ],
  },

  [CASE_STATUS.PENDING_STUDY_PAYMENT_VERIFICATION]: {
    client: [CASE_STATUS.CANCELLED],
    designer: [CASE_STATUS.STUDY_IN_PROGRESS, CASE_STATUS.CANCELLED],
  },

  // Study phase
  [CASE_STATUS.STUDY_IN_PROGRESS]: {
    client: [CASE_STATUS.CANCELLED],
    designer: [
      CASE_STATUS.STUDY_COMPLETED,
      CASE_STATUS.PENDING_RESPONSE,
      CASE_STATUS.CANCELLED,
    ],
  },

  [CASE_STATUS.STUDY_COMPLETED]: {
    client: [CASE_STATUS.CANCELLED],
    designer: [CASE_STATUS.QUOTE_PENDING, CASE_STATUS.CANCELLED],
  },

  // Quote phase
  [CASE_STATUS.QUOTE_PENDING]: {
    client: [CASE_STATUS.CANCELLED],
    designer: [CASE_STATUS.QUOTE_SENT, CASE_STATUS.CANCELLED],
  },

  [CASE_STATUS.QUOTE_SENT]: {
    client: [
      CASE_STATUS.QUOTE_ACCEPTED,
      CASE_STATUS.QUOTE_REJECTED,
      CASE_STATUS.CANCELLED,
    ],
    designer: [CASE_STATUS.CANCELLED],
  },

  [CASE_STATUS.QUOTE_ACCEPTED]: {
    client: [CASE_STATUS.CANCELLED],
    designer: [
      CASE_STATUS.PENDING_PRODUCTION_PAYMENT_VERIFICATION,
      CASE_STATUS.CANCELLED,
    ],
  },

  [CASE_STATUS.QUOTE_REJECTED]: {
    client: [],
    designer: [CASE_STATUS.QUOTE_PENDING, CASE_STATUS.CANCELLED],
  },

  // Production payment
  [CASE_STATUS.PENDING_PRODUCTION_PAYMENT_VERIFICATION]: {
    client: [CASE_STATUS.CANCELLED],
    designer: [CASE_STATUS.IN_PRODUCTION, CASE_STATUS.CANCELLED],
  },

  // Production phase
  [CASE_STATUS.IN_PRODUCTION]: {
    client: [],
    designer: [
      CASE_STATUS.PENDING_RESPONSE,
      CASE_STATUS.PRODUCTION_COMPLETED,
      CASE_STATUS.CANCELLED,
    ],
  },

  [CASE_STATUS.PENDING_RESPONSE]: {
    client: [],
    designer: [
      CASE_STATUS.IN_PRODUCTION,
      CASE_STATUS.PRODUCTION_COMPLETED,
      CASE_STATUS.CANCELLED,
    ],
  },

  [CASE_STATUS.PRODUCTION_COMPLETED]: {
    client: [],
    designer: [
      CASE_STATUS.READY_FOR_PICKUP,
      CASE_STATUS.OUT_FOR_DELIVERY,
      CASE_STATUS.CANCELLED,
    ],
  },

  // Delivery phase
  [CASE_STATUS.READY_FOR_PICKUP]: {
    client: [CASE_STATUS.DELIVERED],
    designer: [CASE_STATUS.DELIVERED, CASE_STATUS.CANCELLED],
  },

  [CASE_STATUS.OUT_FOR_DELIVERY]: {
    client: [CASE_STATUS.DELIVERED],
    designer: [CASE_STATUS.DELIVERED, CASE_STATUS.CANCELLED],
  },

  // Final states
  [CASE_STATUS.DELIVERED]: {
    client: [CASE_STATUS.COMPLETED],
    designer: [CASE_STATUS.COMPLETED, CASE_STATUS.REFUND_REQUESTED],
  },

  [CASE_STATUS.COMPLETED]: {
    client: [CASE_STATUS.REFUND_REQUESTED],
    designer: [CASE_STATUS.REFUND_REQUESTED],
  },

  // Cancellation & Refund
  [CASE_STATUS.CANCELLED]: {
    client: [],
    designer: [],
  },

  [CASE_STATUS.REFUND_REQUESTED]: {
    client: [],
    designer: [CASE_STATUS.REFUNDED, CASE_STATUS.COMPLETED],
  },

  [CASE_STATUS.REFUNDED]: {
    client: [],
    designer: [],
  },
};

/**
 * Status Helper Class
 */
class StatusHelper {
  /**
   * Check if status transition is allowed
   * @param {String} currentStatus - Current case status
   * @param {String} newStatus - Desired new status
   * @param {String} userRole - 'client' or 'designer'
   * @returns {Boolean} Whether transition is allowed
   */
  isTransitionAllowed(currentStatus, newStatus, userRole) {
    const transitions = STATUS_TRANSITIONS[currentStatus];
    if (!transitions) return false;

    const allowedStatuses = transitions[userRole] || [];
    return allowedStatuses.includes(newStatus);
  }

  /**
   * Get allowed next statuses for current state
   * @param {String} currentStatus - Current case status
   * @param {String} userRole - 'client' or 'designer'
   * @returns {Array<String>} Array of allowed next statuses
   */
  getAllowedNextStatuses(currentStatus, userRole) {
    const transitions = STATUS_TRANSITIONS[currentStatus];
    if (!transitions) return [];

    return transitions[userRole] || [];
  }

  /**
   * Get status phase (for UI grouping)
   * @param {String} status - Case status
   * @returns {String} Phase name
   */
  getStatusPhase(status) {
    const phases = {
      [CASE_STATUS.SUBMITTED]: "initial",
      [CASE_STATUS.PENDING_STUDY_PAYMENT_VERIFICATION]: "payment",
      [CASE_STATUS.STUDY_IN_PROGRESS]: "study",
      [CASE_STATUS.STUDY_COMPLETED]: "study",
      [CASE_STATUS.QUOTE_PENDING]: "quote",
      [CASE_STATUS.QUOTE_SENT]: "quote",
      [CASE_STATUS.QUOTE_ACCEPTED]: "quote",
      [CASE_STATUS.QUOTE_REJECTED]: "quote",
      [CASE_STATUS.PENDING_PRODUCTION_PAYMENT_VERIFICATION]: "payment",
      [CASE_STATUS.IN_PRODUCTION]: "production",
      [CASE_STATUS.PENDING_RESPONSE]: "production",
      [CASE_STATUS.PRODUCTION_COMPLETED]: "production",
      [CASE_STATUS.READY_FOR_PICKUP]: "delivery",
      [CASE_STATUS.OUT_FOR_DELIVERY]: "delivery",
      [CASE_STATUS.DELIVERED]: "delivery",
      [CASE_STATUS.COMPLETED]: "final",
      [CASE_STATUS.CANCELLED]: "final",
      [CASE_STATUS.REFUND_REQUESTED]: "final",
      [CASE_STATUS.REFUNDED]: "final",
    };

    return phases[status] || "unknown";
  }

  /**
   * Check if status is final (no more transitions)
   * @param {String} status - Case status
   * @returns {Boolean} Whether status is final
   */
  isFinalStatus(status) {
    return [
      CASE_STATUS.COMPLETED,
      CASE_STATUS.CANCELLED,
      CASE_STATUS.REFUNDED,
    ].includes(status);
  }

  /**
   * Check if status requires client action
   * @param {String} status - Case status
   * @returns {Boolean} Whether client action is needed
   */
  requiresClientAction(status) {
    return [
      CASE_STATUS.PENDING_STUDY_PAYMENT_VERIFICATION,
      CASE_STATUS.QUOTE_SENT,
      CASE_STATUS.PENDING_PRODUCTION_PAYMENT_VERIFICATION,
      CASE_STATUS.READY_FOR_PICKUP,
      CASE_STATUS.OUT_FOR_DELIVERY,
    ].includes(status);
  }

  /**
   * Check if status requires admin action
   * @param {String} status - Case status
   * @returns {Boolean} Whether admin action is needed
   */
  requiresAdminAction(status) {
    return [
      CASE_STATUS.PENDING_STUDY_PAYMENT_VERIFICATION,
      CASE_STATUS.STUDY_COMPLETED,
      CASE_STATUS.QUOTE_REJECTED,
      CASE_STATUS.PENDING_PRODUCTION_PAYMENT_VERIFICATION,
      CASE_STATUS.REFUND_REQUESTED,
    ].includes(status);
  }

  /**
   * Get next expected action description
   * @param {String} status - Case status
   * @param {String} userRole - 'client' or 'designer'
   * @returns {String} Action description
   */
  getNextAction(status, userRole) {
    const actions = {
      client: {
        [CASE_STATUS.PENDING_STUDY_PAYMENT_VERIFICATION]:
          "Upload study fee payment proof",
        [CASE_STATUS.QUOTE_SENT]: "Review and accept/reject quote",
        [CASE_STATUS.QUOTE_ACCEPTED]: "Upload production payment proof",
        [CASE_STATUS.PENDING_PRODUCTION_PAYMENT_VERIFICATION]:
          "Wait for payment verification",
        [CASE_STATUS.READY_FOR_PICKUP]: "Pick up from branch",
        [CASE_STATUS.OUT_FOR_DELIVERY]: "Wait for delivery",
        [CASE_STATUS.DELIVERED]: "Confirm completion",
      },
      designer: {
        [CASE_STATUS.SUBMITTED]: "Start study phase",
        [CASE_STATUS.PENDING_STUDY_PAYMENT_VERIFICATION]: "Verify payment",
        [CASE_STATUS.STUDY_IN_PROGRESS]: "Complete study",
        [CASE_STATUS.STUDY_COMPLETED]: "Create quote (admin)",
        [CASE_STATUS.QUOTE_REJECTED]: "Revise quote (admin)",
        [CASE_STATUS.PENDING_PRODUCTION_PAYMENT_VERIFICATION]:
          "Verify payment (admin)",
        [CASE_STATUS.IN_PRODUCTION]: "Complete production",
        [CASE_STATUS.PRODUCTION_COMPLETED]: "Arrange delivery",
        [CASE_STATUS.REFUND_REQUESTED]: "Process refund (admin)",
      },
    };

    return actions[userRole]?.[status] || "No action required";
  }

  /**
   * Get workflow progress percentage
   * @param {String} status - Case status
   * @returns {Number} Progress percentage (0-100)
   */
  getProgressPercentage(status) {
    const progress = {
      [CASE_STATUS.SUBMITTED]: 5,
      [CASE_STATUS.PENDING_STUDY_PAYMENT_VERIFICATION]: 10,
      [CASE_STATUS.STUDY_IN_PROGRESS]: 20,
      [CASE_STATUS.STUDY_COMPLETED]: 30,
      [CASE_STATUS.QUOTE_PENDING]: 35,
      [CASE_STATUS.QUOTE_SENT]: 40,
      [CASE_STATUS.QUOTE_ACCEPTED]: 45,
      [CASE_STATUS.QUOTE_REJECTED]: 35,
      [CASE_STATUS.PENDING_PRODUCTION_PAYMENT_VERIFICATION]: 50,
      [CASE_STATUS.IN_PRODUCTION]: 60,
      [CASE_STATUS.PENDING_RESPONSE]: 65,
      [CASE_STATUS.PRODUCTION_COMPLETED]: 75,
      [CASE_STATUS.READY_FOR_PICKUP]: 85,
      [CASE_STATUS.OUT_FOR_DELIVERY]: 90,
      [CASE_STATUS.DELIVERED]: 95,
      [CASE_STATUS.COMPLETED]: 100,
      [CASE_STATUS.CANCELLED]: 0,
      [CASE_STATUS.REFUND_REQUESTED]: 0,
      [CASE_STATUS.REFUNDED]: 0,
    };

    return progress[status] || 0;
  }
}

// Export singleton instance
export default new StatusHelper();
