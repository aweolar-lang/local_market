import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
  // 1. Security Check: Lock this down to Vercel Cron only
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Initialize Supabase Admin Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const bucketName = 'item-images'; 

  try {
    // 3. Get ALL active items from the database
    const { data: items, error: dbError } = await supabase
      .from('items')
      .select('images');

    if (dbError) throw dbError;

    // Combine all active URLs into one giant block of text to easily search against
    const activeImageUrls = items
      .map(item => item.images)
      .flat()
      .filter(Boolean)
      .join(',');

    // 4. List files currently sitting in the storage bucket
    const { data: files, error: storageError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1000 }); 

    if (storageError) throw storageError;
    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'Storage bucket is empty.' });
    }

    // 5. Find the "Orphans" (Files that exist in storage, but NOT in the database)
    const filesToDelete: string[] = [];
    
    for (const file of files) {
      // Skip hidden Supabase files
      if (file.name === '.emptyFolderPlaceholder') continue; 

      // If this file's name isn't found anywhere in our active database list, mark it for death
      if (!activeImageUrls.includes(file.name)) {
        filesToDelete.push(file.name);
      }
    }

    // 6. Sweep up the trash!
    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove(filesToDelete);

      if (deleteError) throw deleteError;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Garbage collection complete! Swept up ${filesToDelete.length} orphaned images.` 
    });

  } catch (error) {
    console.error('Garbage collection failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}