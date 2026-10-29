import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateObjectIdParam } from '../middlewares/validateObjectId.middleware.js';
import {
  createResourceSchema,
  resourceQuerySchema,
  updateResourceSchema,
  updateEpubProgressSchema,
} from '../validators/resource.validator.js';
import {
  createResource,
  getResources,
  updateResource,
  deleteResource,
} from '../controllers/resource.controller.js';
import { uploadAttachmentFile } from '../middlewares/attachmentUpload.middleware.js';
import {
  uploadAttachment,
  streamAttachment,
  deleteAttachment,
  updateEpubProgress,
} from '../controllers/attachment.controller.js';

const router = Router();

router.use(verifyJWT);
router.param('id', validateObjectIdParam);

// EPUB reading position tracking
router
  .route('/:id/attachment/progress')
  .patch(validate(updateEpubProgressSchema), updateEpubProgress);

// Attachment routes (both /attachment and /pdf supported)
router
  .route('/:id/attachment')
  .post(uploadAttachmentFile, uploadAttachment)
  .put(uploadAttachmentFile, uploadAttachment)
  .get(streamAttachment)
  .delete(deleteAttachment);

router
  .route('/:id/pdf')
  .post(uploadAttachmentFile, uploadAttachment)
  .put(uploadAttachmentFile, uploadAttachment)
  .get(streamAttachment)
  .delete(deleteAttachment);

router
  .route('/')
  .post(validate(createResourceSchema), createResource)
  .get(validate(resourceQuerySchema, 'query'), getResources);

router
  .route('/:id')
  .patch(validate(updateResourceSchema), updateResource)
  .delete(deleteResource);

export default router;
