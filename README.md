# flipped-be

# Create Google Cloud Bucket
1. Create a Google Cloud Bucket
2. Go to bucket permissions, then add grant access
3. Set new principals to allUsers
4. Set role to Storage Object Viewer
5. Save

# Create Google Cloud Service Account
1. Go to API & Services > Cloud Storage
2. Click on Create Credentials
3. Create a Service Account Credential
4. Fill in the details
5. Set the role to Storage > Storage Object Admin
6. Click on Create
7. Click on the Service Account
8. Go to Keys tab
9. Click on Add Key
10. Select JSON
11. Click on Create

# Disable Cloud Storage CORS
1. Go to cloud shell
2. Edit and paste this script:
```
printf '[{"origin": ["*"],"responseHeader": ["*"],"method":
["GET","POST","PUT","DELETE","HEAD"],"maxAgeSeconds": 86400}]' > cors.json

gsutil cors set cors.json gs://olearning-data
```
3. Run the script
4. Authorize the script