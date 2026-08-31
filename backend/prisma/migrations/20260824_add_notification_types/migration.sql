-- Add new notification types for accommodation events
ALTER TYPE "NotificationType" ADD VALUE 'REQUEST_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'REQUEST_RESPONSE';
ALTER TYPE "NotificationType" ADD VALUE 'REVIEW_SUBMITTED';
