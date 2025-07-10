const VitalSign = require('../models/VitalSign');
const Patient = require('../models/Patient'); // Ensure Patient model is imported
const User = require('../models/User'); // Ensure User model is imported
const logger = require('../utils/logger');
const ErrorResponse = require('../utils/errorResponse'); // Assuming you have this utility

// @desc    Create new vital signs record
// @route   POST /api/v1/vital-signs
// @access  Private (doctor, nurse, admin)
exports.createVitalSign = async (req, res, next) => {
  try {
    const { patientId, recordedBy, recordDate, temperature, bloodPressureSystolic, bloodPressureDiastolic,
      heartRate, respiratoryRate, oxygenSaturation, weightKg, heightCm, painLevel, bloodGlucose, notes, status } = req.body;

    // Validate patient and recordedBy IDs
    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
      return next(new ErrorResponse('Invalid patient ID format or patient not found', 400, 'INVALID_PATIENT_ID'));
    }

    const recordedByUser = await User.findById(recordedBy);
    if (!recordedByUser) {
      return next(new ErrorResponse('Invalid recordedBy user ID or user not found', 400, 'INVALID_USER_ID'));
    }

    // Construct vital sign data, handling nested objects for temperature, bloodPressure, weight, height, bloodGlucose
    const vitalSignData = {
      patient: patientId,
      recordedBy: recordedBy,
      recordedAt: recordDate || Date.now(),
      notes,
      status: status || 'draft' // Default to draft if not specified
    };

    if (temperature !== undefined) {
      vitalSignData.temperature = { value: temperature, unit: 'C' }; // Assuming Celsius by default for simplicity
    }
    if (bloodPressureSystolic !== undefined && bloodPressureDiastolic !== undefined) {
      vitalSignData.bloodPressure = { systolic: bloodPressureSystolic, diastolic: bloodPressureDiastolic };
    }
    if (heartRate !== undefined) {
      vitalSignData.heartRate = heartRate;
    }
    if (respiratoryRate !== undefined) {
      vitalSignData.respiratoryRate = respiratoryRate;
    }
    if (oxygenSaturation !== undefined) {
      vitalSignData.oxygenSaturation = oxygenSaturation;
    }
    if (weightKg !== undefined) {
      vitalSignData.weight = { value: weightKg, unit: 'kg' };
    }
    if (heightCm !== undefined) {
      vitalSignData.height = { value: heightCm, unit: 'cm' };
    }
    if (painLevel !== undefined) {
      vitalSignData.painLevel = painLevel;
    }
    if (bloodGlucose !== undefined) {
      vitalSignData.bloodGlucose = { value: bloodGlucose, unit: 'mg/dL' }; // Assuming mg/dL by default
    }

    const vitalSign = new VitalSign(vitalSignData);
    await vitalSign.save();

    // Add reference to patient's vitalSigns array
    await patientExists.addVitalSignReference(vitalSign._id);

    // Populate patient and recordedBy for the response
    const populatedVitalSign = await VitalSign.findById(vitalSign._id)
      .populate({
        path: 'patient',
        select: 'firstName lastName dateOfBirth gender patientId' // Explicitly select fields for virtuals
      })
      .populate('recordedBy', 'fullName email title'); // Populate recordedBy for summary

    logger.audit('vital_sign_created', req.user._id, 'vital_signs', {
      vitalSignId: vitalSign._id,
      patientId: vitalSign.patient,
      status: vitalSign.status
    });

    res.status(201).json({
      success: true,
      message: vitalSign.status === 'draft' ? 'Vital sign draft saved' : 'Vital sign created successfully',
      data: populatedVitalSign.getSummary(),
      debug: {
        vitalSignId: vitalSign._id,
        patientId: vitalSign.patient,
        status: vitalSign.status,
        recordedAt: vitalSign.recordedAt
      }
    });
  } catch (error) {
    logger.error('Error creating vital sign:', error);
    next(error);
  }
};

// @desc    Get all vital signs records with filtering and pagination
// @route   GET /api/v1/vital-signs
// @access  Private (doctor, nurse, admin)
exports.getAllVitalSigns = async (req, res, next) => {
  try {
    const { patientId, status, sortBy, sortOrder, page, limit } = req.query;
    const query = {};

    if (patientId) {
      query.patient = patientId;
    }
    if (status) {
      query.status = status;
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.recordedAt = -1; // Default sort by latest record
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
    const skip = (pageNumber - 1) * limitNumber;

    const vitalSigns = await VitalSign.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: 'patient',
        select: 'firstName lastName dateOfBirth gender patientId' // Explicitly select fields for virtuals
      })
      .populate('recordedBy', 'fullName email title'); // Populate recordedBy for summary

    const totalCount = await VitalSign.countDocuments(query);

    const vitalSignsSummaries = vitalSigns.map(vs => vs.getSummary());

    logger.audit('get_all_vital_signs', req.user._id, 'vital_signs', {
      query: req.query,
      count: vitalSigns.length
    });

    res.status(200).json({
      success: true,
      message: 'Vital signs retrieved successfully',
      data: {
        vitalSigns: vitalSignsSummaries,
        totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber)
      },
      debug: {
        query: query,
        limit: limitNumber,
        sortOrder: sortOrder || 'desc'
      }
    });
  } catch (error) {
    logger.error('Error getting all vital signs:', error);
    next(error);
  }
};

// @desc    Get a single vital signs record by ID
// @route   GET /api/v1/vital-signs/:id
// @access  Private (doctor, nurse, admin)
exports.getVitalSignById = async (req, res, next) => {
  try {
    const vitalSign = await VitalSign.findById(req.params.id)
      .populate({
        path: 'patient',
        select: 'firstName lastName dateOfBirth gender patientId' // Explicitly select fields for virtuals
      })
      .populate('recordedBy', 'fullName email title')
      .populate('amendedBy', 'fullName email title');

    if (!vitalSign) {
      return next(new ErrorResponse('Vital sign not found', 404));
    }

    logger.audit('get_vital_sign_by_id', req.user._id, 'vital_signs', {
      vitalSignId: vitalSign._id,
      patientId: vitalSign.patient._id
    });

    res.status(200).json({
      success: true,
      message: 'Vital sign retrieved successfully',
      data: vitalSign.getSummary(),
      debug: {
        vitalSignId: vitalSign._id,
        patientId: vitalSign.patient._id,
        status: vitalSign.status
      }
    });
  } catch (error) {
    logger.error('Error getting vital sign by ID:', error);
    next(error);
  }
};

// @desc    Get all vital signs records for a specific patient
// @route   GET /api/v1/vital-signs/patient/:patientId
// @access  Private (doctor, nurse, admin)
exports.getVitalSignsByPatient = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;

    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
      return next(new ErrorResponse('Patient not found', 404));
    }

    const vitalSigns = await VitalSign.find({ patient: patientId })
      .sort({ recordedAt: -1 })
      .populate({
        path: 'patient',
        select: 'firstName lastName dateOfBirth gender patientId' // Explicitly select fields for virtuals
      })
      .populate('recordedBy', 'fullName email title')
      .populate('amendedBy', 'fullName email title');

    const vitalSignsSummaries = vitalSigns.map(vs => vs.getSummary());

    // Populate patient details at the top level of the response
    const patientSummary = patientExists.getSummaryForRole(req.user.role); // Use getSummaryForRole to get patient details with virtuals

    logger.audit('get_vital_signs_by_patient', req.user._id, 'vital_signs', {
      patientId: patientId,
      count: vitalSigns.length
    });

    res.status(200).json({
      success: true,
      message: 'Patient vital signs retrieved successfully',
      data: {
        patient: {
          _id: patientSummary._id,
          patientId: patientSummary.patientId,
          fullName: patientSummary.fullName,
          age: patientSummary.age,
          gender: patientSummary.gender
        },
        vitalSigns: vitalSignsSummaries,
        totalCount: vitalSigns.length
      },
      debug: {
        patientId: patientId,
        query: { patient: patientId },
        limit: 50, // Default limit for this endpoint if not paginated
        sortOrder: 'desc'
      }
    });
  } catch (error) {
    logger.error('Error getting vital signs by patient:', error);
    next(error);
  }
};

// @desc    Update a vital signs record (only if status is 'draft')
// @route   PUT /api/v1/vital-signs/:id
// @access  Private (doctor, nurse, admin)
exports.updateVitalSign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const vitalSign = await VitalSign.findById(id);

    if (!vitalSign) {
      return next(new ErrorResponse('Vital sign not found', 404));
    }

    if (vitalSign.status !== 'draft') {
      return next(new ErrorResponse('Only draft vital signs can be updated directly. Use /amend for final records.', 400));
    }

    // Apply updates
    Object.keys(updateFields).forEach(key => {
      // Handle nested objects for temperature, bloodPressure, weight, height, bloodGlucose
      if (['temperature', 'bloodPressure', 'weight', 'height', 'bloodGlucose'].includes(key)) {
        vitalSign[key] = { ...vitalSign[key], ...updateFields[key] };
      } else {
        vitalSign[key] = updateFields[key];
      }
    });

    vitalSign.updatedBy = req.user._id;
    vitalSign.updatedAt = new Date();

    await vitalSign.save();

    // Re-populate patient and recordedBy for the response
    const updatedVitalSign = await VitalSign.findById(vitalSign._id)
      .populate({
        path: 'patient',
        select: 'firstName lastName dateOfBirth gender patientId' // Explicitly select fields for virtuals
      })
      .populate('recordedBy', 'fullName email title');

    logger.audit('vital_sign_updated', req.user._id, 'vital_signs', {
      vitalSignId: vitalSign._id,
      patientId: vitalSign.patient,
      updatedFields: Object.keys(updateFields)
    });

    res.status(200).json({
      success: true,
      message: 'Vital sign updated successfully',
      data: updatedVitalSign.getSummary(),
      debug: {
        vitalSignId: vitalSign._id,
        patientId: vitalSign.patient._id,
        updatedFields: Object.keys(updateFields)
      }
    });
  } catch (error) {
    logger.error('Error updating vital sign:', error);
    next(error);
  }
};

// @desc    Finalize a vital signs record (change status from draft to final)
// @route   PATCH /api/v1/vital-signs/:id/finalize
// @access  Private (doctor, nurse, admin)
exports.finalizeVitalSign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vitalSign = await VitalSign.findById(id);

    if (!vitalSign) {
      return next(new ErrorResponse('Vital sign not found', 404));
    }

    if (vitalSign.status !== 'draft') {
      return next(new ErrorResponse('Only draft vital signs can be finalized', 400));
    }

    await vitalSign.markAsFinal(); // This method sets status to 'final' and saves

    // Re-populate patient and recordedBy for the response
    const finalizedVitalSign = await VitalSign.findById(vitalSign._id)
      .populate({
        path: 'patient',
        select: 'firstName lastName dateOfBirth gender patientId' // Explicitly select fields for virtuals
      })
      .populate('recordedBy', 'fullName email title');

    logger.audit('vital_sign_finalized', req.user._id, 'vital_signs', {
      vitalSignId: vitalSign._id,
      patientId: vitalSign.patient._id
    });

    res.status(200).json({
      success: true,
      message: 'Vital sign finalized successfully',
      data: finalizedVitalSign.getSummary(),
      debug: {
        vitalSignId: vitalSign._id,
        patientId: vitalSign.patient._id,
        status: vitalSign.status
      }
    });
  } catch (error) {
    logger.error('Error finalizing vital sign:', error);
    next(error);
  }
};

// @desc    Amend a final vital signs record
// @route   PATCH /api/v1/vital-signs/:id/amend
// @access  Private (doctor, nurse, admin)
exports.amendVitalSign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Reason for amendment is required

    if (!reason || reason.trim() === '') {
      return next(new ErrorResponse('Amendment reason is required', 400));
    }

    const vitalSign = await VitalSign.findById(id);

    if (!vitalSign) {
      return next(new ErrorResponse('Vital sign not found', 404));
    }

    if (vitalSign.status !== 'final' && vitalSign.status !== 'amended') {
      return next(new ErrorResponse('Only final or already amended vital signs can be amended', 400));
    }

    // Mark as amended and save
    await vitalSign.markAsAmended(req.user._id, reason); // Pass current user ID and reason

    // Re-populate patient and recordedBy for the response
    const amendedVitalSign = await VitalSign.findById(vitalSign._id)
      .populate({
        path: 'patient',
        select: 'firstName lastName dateOfBirth gender patientId' // Explicitly select fields for virtuals
      })
      .populate('recordedBy', 'fullName email title')
      .populate('amendedBy', 'fullName email title');

    // DEBUG LOG HERE to confirm populated patient object
    console.log('--- DEBUG: Populated Patient Object in amendVitalSign ---');
    console.log(amendedVitalSign.patient);
    console.log('---------------------------------------');

    logger.audit('vital_sign_amended', req.user._id, 'vital_signs', {
      vitalSignId: vitalSign._id,
      patientId: vitalSign.patient,
      amendmentReason: reason
    });

    res.status(200).json({
      success: true,
      message: 'Vital sign amended successfully',
      data: amendedVitalSign.getSummary(),
      debug: {
        vitalSignId: vitalSign._id,
        patientId: vitalSign.patient._id,
        amendedAt: vitalSign.amendedAt,
        reason: vitalSign.amendmentReason
      }
    });
  } catch (error) {
    logger.error('Error amending vital sign:', error);
    next(error);
  }
};

// @desc    Delete a vital signs record (only if status is 'draft')
// @route   DELETE /api/v1/vital-signs/:id
// @access  Private (admin)
exports.deleteVitalSign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vitalSign = await VitalSign.findById(id);

    if (!vitalSign) {
      return next(new ErrorResponse('Vital sign not found', 404));
    }

    // Only allow deletion of 'draft' vital signs
    if (vitalSign.status !== 'draft') {
      return next(new ErrorResponse('Only draft vital signs can be deleted.', 400));
    }

    // Remove reference from patient's vitalSigns array
    await Patient.findByIdAndUpdate(
      vitalSign.patient,
      { $pull: { vitalSigns: vitalSign._id } },
      { new: true }
    );

    await vitalSign.deleteOne(); // Use deleteOne() for Mongoose 6+

    logger.audit('vital_sign_deleted', req.user._id, 'vital_signs', {
      vitalSignId: vitalSign._id,
      patientId: vitalSign.patient
    });

    res.status(200).json({
      success: true,
      message: 'Vital sign deleted successfully',
      debug: {
        vitalSignId: vitalSign._id,
        patientId: vitalSign.patient
      }
    });
  } catch (error) {
    logger.error('Error deleting vital sign:', error);
    next(error);
  }
}; 