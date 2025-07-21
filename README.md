# MedBlock

## Project Structure

```
MedBlock-main-check/
  - ai/
    - venv/
      ...
  - frontend/
    - src/
      - App.css
      - App.tsx
      - assets/
      - components/
        - admin/
        - chat/
        - common/
        - dashboard/
        - insurance/
          - QuoteRequestModal.tsx
        - layout/
        - LoadingSpinner.tsx
        - Modal.tsx
      - context/
      - features/
      - hooks/
      - layouts/
      - pages/
        - InsuranceMarketplacePage.tsx
      - services/
      - store/
      - types/
      - utils/
  - src/
    - config/
    - controllers/
    - docs/
    - middleware/
    - models/
    - routes/
      - insurance.js
    - server.js
    - services/
    - uploads/
    - utils/
  - ...
```

## Insurance Marketplace Features

- **Get Quote**: Users can request a quote for any insurance policy. Opens a modal form, submits to `/api/v1/insurance/quote` with JWT.
- **Learn More**: (To be implemented) Users can view detailed policy info in a modal, fetched from `/api/v1/insurance/policy/:policyId`.
- **Compare Plans**: Users can select multiple policies and compare them using `/api/v1/insurance/compare`. Results are shown in a modal.

## How to Use
- Log in as an admin or user.
- Navigate to the Insurance Marketplace page.
- Use filters, select plans, and use the Get Quote or Compare features as needed.

---

For more details, see `MEDBLOCK ACHIEVEMENTS.md`. 