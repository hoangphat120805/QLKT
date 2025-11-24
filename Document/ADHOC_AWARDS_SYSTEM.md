# Ad-hoc Awards Management System (Khen thưởng đột xuất)

## Overview

This system allows Admin users to create and manage ad-hoc awards (emergency commendations) for both individuals and units with multiple file attachments.

## Architecture

### Backend

#### 1. Database Schema

The existing `KhenThuongDotXuat` model in Prisma schema supports:

- **Type**: Individual (`CA_NHAN`) or Group (`TAP_THE`)
- **Target**: Personnel or Unit (CO_QUAN_DON_VI / DON_VI_TRUC_THUOC)
- **Award Details**: Award form, year, rank, position, notes
- **Decision**: Decision number
- **Files**: Multiple file attachments stored in JSON format

#### 2. API Endpoints

All endpoints require Admin authentication.

##### Create Ad-hoc Award

```
POST /api/adhoc-awards
Content-Type: multipart/form-data

Body:
- type: "CA_NHAN" | "TAP_THE" (required)
- year: number (required)
- awardForm: string (required) - e.g., "Giấy khen của BQP"
- personnelId: string (required if type=CA_NHAN)
- unitId: string (required if type=TAP_THE)
- unitType: "CO_QUAN_DON_VI" | "DON_VI_TRUC_THUOC" (required if type=TAP_THE)
- rank: string (optional, for CA_NHAN)
- position: string (optional, for CA_NHAN)
- note: string (optional)
- decisionNumber: string (optional)
- files: File[] (optional, max 10 files)

Response:
{
  "success": true,
  "message": "Tạo khen thưởng đột xuất thành công",
  "data": { ...adhocAward }
}
```

##### Get All Ad-hoc Awards

```
GET /api/adhoc-awards?type=CA_NHAN&year=2025&page=1&limit=20

Response:
{
  "success": true,
  "data": [...adhocAwards],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

##### Get Single Ad-hoc Award

```
GET /api/adhoc-awards/:id

Response:
{
  "success": true,
  "data": { ...adhocAward }
}
```

##### Update Ad-hoc Award

```
PUT /api/adhoc-awards/:id
Content-Type: multipart/form-data

Body:
- awardForm: string (optional)
- year: number (optional)
- rank: string (optional)
- position: string (optional)
- note: string (optional)
- decisionNumber: string (optional)
- files: File[] (optional)
- removeFileIndexes: number[] (optional) - indexes of files to remove

Response:
{
  "success": true,
  "message": "Cập nhật khen thưởng đột xuất thành công",
  "data": { ...adhocAward }
}
```

##### Delete Ad-hoc Award

```
DELETE /api/adhoc-awards/:id

Response:
{
  "success": true,
  "message": "Xóa khen thưởng đột xuất thành công"
}
```

##### Get Ad-hoc Awards by Personnel

```
GET /api/adhoc-awards/personnel/:personnelId

Response:
{
  "success": true,
  "data": [...adhocAwards]
}
```

##### Get Ad-hoc Awards by Unit

```
GET /api/adhoc-awards/unit/:unitId?unitType=CO_QUAN_DON_VI

Response:
{
  "success": true,
  "data": [...adhocAwards]
}
```

#### 3. File Structure

**Backend:**

```
BE-QLKT/
├── src/
│   ├── controllers/
│   │   └── adhocAward.controller.js    # Request handlers
│   ├── services/
│   │   └── adhocAward.service.js       # Business logic
│   └── routes/
│       ├── adhocAward.routes.js        # Route definitions
│       └── index.js                     # Main routes (updated)
└── uploads/
    └── adhoc-awards/                    # File storage
```

**Frontend:**

```
FE-QLKT/
├── src/
│   ├── app/
│   │   └── admin/
│   │       └── adhoc-awards/
│   │           └── page.tsx            # Main page component
│   └── lib/
│       └── api-client.ts               # API methods (updated)
```

### Frontend

#### Features

1. **List View**

   - Display all ad-hoc awards in a table
   - Filter by type, year
   - Sortable columns
   - Pagination

2. **Create/Edit Modal**

   - Type selection (Individual/Group)
   - Dynamic form based on type
   - Personnel/Unit selection with search
   - File upload (max 10 files)
   - Support for PDF, Word, Excel, images

3. **File Management**

   - Multiple file upload
   - View existing files
   - Remove files during edit
   - File type validation

4. **Responsive Design**
   - Mobile-friendly table
   - Horizontal scroll for large tables
   - Accessible forms

#### Components Used

- **Ant Design Components**: Table, Modal, Form, Upload, Select, Input, etc.
- **Icons**: UserOutlined, TeamOutlined, FileOutlined, etc.

## Usage Guide

### For Admin Users

#### Creating an Ad-hoc Award

1. Navigate to `/admin/adhoc-awards`
2. Click "Thêm khen thưởng" button
3. Select type (Individual or Group)
4. Fill in required fields:
   - For Individual: Select personnel, enter award details
   - For Group: Select unit type and unit
5. Enter award form (e.g., "Giấy khen của BQP")
6. Optionally add:
   - Decision number
   - Files (PDFs, documents, images)
   - Notes
7. Click "Tạo" to save

#### Editing an Ad-hoc Award

1. Find the award in the list
2. Click the edit icon (✏️)
3. Modify the fields you want to change
4. Add new files or remove existing ones
5. Click "Cập nhật" to save changes

#### Deleting an Ad-hoc Award

1. Find the award in the list
2. Click the delete icon (🗑️)
3. Confirm deletion
4. All associated files will be deleted automatically

## File Upload

### Supported File Types

- PDF: `.pdf`
- Word: `.doc`, `.docx`
- Excel: `.xls`, `.xlsx`
- Images: `.jpg`, `.jpeg`, `.png`

### File Size Limit

- Maximum: 50MB per file
- Maximum files per award: 10

### File Storage

- Files are stored in: `BE-QLKT/uploads/adhoc-awards/`
- Each file is renamed with timestamp to avoid conflicts
- File metadata is stored in database (original name, size, mime type)

## Security

### Authentication & Authorization

- All endpoints require valid JWT token
- Only ADMIN role can access ad-hoc awards management
- Middleware: `authenticateToken` + `authorizeRole(['ADMIN'])`

### File Validation

- File type validation on server
- File size validation
- Malicious file prevention

### Data Validation

- Required field validation
- Type checking (CA_NHAN vs TAP_THE)
- Personnel/Unit existence verification

## Database Operations

### Create Operation

1. Verify admin permissions
2. Validate personnel/unit existence
3. Upload files to server
4. Store file metadata in JSON
5. Create database record

### Update Operation

1. Verify admin permissions
2. Get existing record
3. Handle file removal (delete from disk)
4. Upload new files
5. Update database record

### Delete Operation

1. Verify admin permissions
2. Get existing record
3. Delete all associated files from disk
4. Delete database record

## Error Handling

### Backend

- Try-catch blocks in all service methods
- Descriptive error messages
- HTTP status codes (400, 404, 500)

### Frontend

- Loading states for async operations
- Error messages via Ant Design message component
- Form validation before submission

## Testing Checklist

### Backend API

- [ ] Create individual award
- [ ] Create group award
- [ ] Upload multiple files
- [ ] Get all awards with pagination
- [ ] Filter by type and year
- [ ] Get single award by ID
- [ ] Update award details
- [ ] Update files (add/remove)
- [ ] Delete award
- [ ] Get awards by personnel
- [ ] Get awards by unit
- [ ] Authorization check (admin only)

### Frontend

- [ ] Display awards list
- [ ] Open create modal
- [ ] Create individual award
- [ ] Create group award
- [ ] Upload files
- [ ] Search personnel
- [ ] Search units
- [ ] Edit award
- [ ] Remove files during edit
- [ ] Delete award
- [ ] Responsive design
- [ ] Form validation

## Future Enhancements

1. **Export to Excel**: Export filtered awards list
2. **Print View**: Printable award certificates
3. **Bulk Operations**: Create multiple awards at once
4. **File Preview**: Preview PDFs and images in browser
5. **Notification System**: Notify personnel when they receive awards
6. **Audit Log**: Track all create/update/delete operations
7. **Statistics**: Dashboard with award statistics

## Troubleshooting

### Issue: Files not uploading

- Check file size (max 50MB)
- Check file type (must be in supported list)
- Check server disk space
- Check multer configuration

### Issue: 403 Forbidden

- Verify user has ADMIN role
- Check JWT token validity
- Check authorization middleware

### Issue: Personnel/Unit not found

- Verify IDs are correct
- Check database records exist
- Check cascade delete hasn't removed referenced data

## API Documentation

For complete API documentation, see Postman collection or Swagger docs.

## Contact & Support

For issues or questions, contact the development team.
