# Cloudinary Setup Instructions

## Getting Your Cloudinary Credentials

1. **Sign up for Cloudinary** (if you don't have an account):
   - Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
   - Create a free account (no credit card required)

2. **Get your credentials**:
   - After signing up, you'll be redirected to your Dashboard
   - Or go to [https://cloudinary.com/console](https://cloudinary.com/console)
   - You'll see your credentials at the top of the page:
     - **Cloud Name**
     - **API Key**
     - **API Secret**

3. **Add credentials to your `.env` file**:
   - Open `/Users/nekpalyadav/Desktop/food-delivery-app/backend/.env`
   - Replace the placeholder values with your actual credentials:
     ```env
     CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
     CLOUDINARY_API_KEY=your_actual_api_key
     CLOUDINARY_API_SECRET=your_actual_api_secret
     ```

4. **Restart the backend server**:
   - Stop the current server (Ctrl+C in the terminal)
   - Start it again: `nodemon index.js`

## Testing the Integration

1. **Login as admin** in your application
2. **Navigate to Admin Dashboard → Menu Items**
3. **Click "Add New Item"**
4. **Fill in the form**:
   - Name: e.g., "Margherita Pizza"
   - Description: e.g., "Classic Italian pizza with fresh mozzarella"
   - Price: e.g., 12.99
   - Category: Select from dropdown
   - Upload an image (JPG, PNG, or WebP)
5. **Submit the form**
6. **Verify**:
   - Item appears in the menu list
   - Image is displayed correctly
   - Check your Cloudinary dashboard to see the uploaded image

## Features Implemented

✅ **Image Upload**: Upload food images when creating menu items  
✅ **Image Update**: Replace images when editing menu items (old image is automatically deleted)  
✅ **Image Deletion**: Images are deleted from Cloudinary when menu items are deleted  
✅ **Automatic Optimization**: Images are automatically resized to 800x800px  
✅ **Format Support**: JPG, JPEG, PNG, and WebP formats  
✅ **File Size Limit**: 5MB maximum file size  

## Troubleshooting

**Error: "Image is required"**
- Make sure you've selected an image file before submitting

**Error: "Failed to save menu item"**
- Check that your Cloudinary credentials are correct in the `.env` file
- Make sure the backend server has been restarted after adding credentials
- Check the backend console for detailed error messages

**Images not loading**
- Verify your Cloudinary credentials are correct
- Check your internet connection
- Look at the browser console for any CORS or network errors
