// app/biz/api/agents/upload-avatar/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const agentId = formData.get('agentId') as string;

    if (!file || !userId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'File, userId, and agentId are required' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File must be an image (JPG, PNG, GIF, or WEBP)' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify agent belongs to user
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .eq('profile_id', userId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete old avatars for this agent
    const { data: existingFiles } = await supabase.storage
      .from('agent_avatars')
      .list(`${userId}/${agentId}`);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `${userId}/${agentId}/${file.name}`);
      await supabase.storage
        .from('agent_avatars')
        .remove(filesToDelete);
      console.log('🗑️ Deleted old agent avatars:', filesToDelete);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${agentId}/avatar-${Date.now()}.${fileExt}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agent_avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('agent_avatars')
      .getPublicUrl(fileName);

    // Update agent with new avatar URL
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        avatar_url: publicUrl,
      })
      .eq('id', agentId);

    if (updateError) {
      console.error('Agent update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update agent with new avatar URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl
    });
  } catch (error: any) {
    console.error('Agent avatar upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}