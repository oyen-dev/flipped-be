# flipped-be

printf '[{"origin": ["*"],"responseHeader": ["*"],"method":
["GET","POST","HEAD"],"maxAgeSeconds": 86400}]' > cors.json

gsutil cors set cors.json gs://flipped-storage