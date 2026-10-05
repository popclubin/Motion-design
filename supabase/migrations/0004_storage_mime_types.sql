-- Allow all mime types on thumbnails bucket
update storage.buckets
set allowed_mime_types = null
where id = 'thumbnails';
