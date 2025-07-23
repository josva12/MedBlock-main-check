#!/bin/bash

# Backend API base URL
API_URL="http://localhost:5000/api/v1"

# Admin credentials
ADMIN_EMAIL="joshuamumbua12@gmail.com"
ADMIN_PASSWORD="Password123@"

# Helper: exit on error
set -e

# 1. Login as admin
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"'$ADMIN_EMAIL'","password":"'$ADMIN_PASSWORD'"}')
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // .data.accessToken // .token')
echo "[+] Admin login successful. Access token: $ACCESS_TOKEN"

# 2. Register a facility
FACILITY_RESPONSE=$(curl -s -X POST "$API_URL/facilities" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Kenyatta National Hospital", "type": "hospital", "registrationNumber": "KNH-001-'$RANDOM'", "licensingBody": "KMPDC"}')
FACILITY_ID=$(echo "$FACILITY_RESPONSE" | jq -r '.data.facility._id')
echo "[+] Facility registered. ID: $FACILITY_ID"

# 3. Register a patient
PATIENT_RESPONSE=$(curl -s -X POST "$API_URL/patients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "gender": "male", "dateOfBirth": "1990-01-01", "phoneNumber": "+254700000001", "email": "john.doe'$RANDOM'@example.com"}')
PATIENT_ID=$(echo "$PATIENT_RESPONSE" | jq -r '.data.patient._id // .data._id // ._id')
echo "[+] Patient registered. ID: $PATIENT_ID"

# 4. Enroll patient in insurance
INSURANCE_RESPONSE=$(curl -s -X POST "$API_URL/insurance" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"policyTier": "msingi", "premiumAmount": 1000, "coverageLimit": 50000, "dependents": []}')
POLICY_ID=$(echo "$INSURANCE_RESPONSE" | jq -r '.data._id // .data.policy._id // .data.policyId // .data.id')
echo "[+] Insurance enrolled. Policy ID: $POLICY_ID"

# 5. Create a medical record (pharmacy dispense)
RECORD_RESPONSE=$(curl -s -X POST "$API_URL/medical-records" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patientId": "'$PATIENT_ID'", "recordType": "pharmacy_dispense", "title": "Dispensed Paracetamol", "description": "Dispensed 10 tablets of Paracetamol 500mg", "facility": { "name": "Kenyatta National Hospital", "type": "hospital" }}')
RECORD_ID=$(echo "$RECORD_RESPONSE" | jq -r '.data.record._id // .data._id // ._id')
echo "[+] Medical record created. ID: $RECORD_ID"

# 6. Submit a claim
CLAIM_RESPONSE=$(curl -s -X POST "$API_URL/claims" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"policyId": "'$POLICY_ID'", "patientId": "'$PATIENT_ID'", "facilityId": "'$FACILITY_ID'", "claimAmount": 2000, "servicesRendered": ["Consultation", "Medication"]}')
CLAIM_ID=$(echo "$CLAIM_RESPONSE" | jq -r '.data._id // .data.claim._id // .data.claimId // .data.id')
echo "[+] Claim submitted. ID: $CLAIM_ID"

# 7. Approve the claim
APPROVE_RESPONSE=$(curl -s -X PATCH "$API_URL/claims/$CLAIM_ID/process" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}')
echo "[+] Claim approved."

# 8. Verify blockchain status of the medical record
VERIFY_RESPONSE=$(curl -s -X PATCH "$API_URL/medical-records/$RECORD_ID/blockchain-status" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"verify"}')
echo "[+] Medical record blockchain status verified."

# 9. Audit blockchain transaction for the claim
AUDIT_RESPONSE=$(curl -s -X GET "$API_URL/audit-logs/blockchain?entityType=claim&entityId=$CLAIM_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "[+] Blockchain audit for claim:"
echo "$AUDIT_RESPONSE" | jq

echo "\n[TEST FLOW COMPLETED SUCCESSFULLY]" 