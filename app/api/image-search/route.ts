import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const unlinkAsync = promisify(fs.unlink);

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const removeBackground = formData.get('removeBg') !== 'false'; // Default to true
    const topK = parseInt(formData.get('topK')?.toString() || '12');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Create a temporary directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    try {
      await mkdirAsync(tempDir, { recursive: true });
    } catch (err) {
      // Directory might already exist, which is fine
    }

    // Generate a unique filename
    const uniqueId = uuidv4();
    const filename = `${uniqueId}-${file.name}`;
    const filepath = path.join(tempDir, filename);

    // Convert the file to a buffer and save it
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFileAsync(filepath, buffer);

    // Convert the image file to base64
    const fileBase64 = buffer.toString('base64');
    
    // Save base64 data to a temporary file instead of passing it directly
    const base64TempFile = path.join(tempDir, `${uniqueId}-base64.txt`);
    await writeFileAsync(base64TempFile, fileBase64);

    // Call the Python script with the path to the base64 file
    const scriptPath = path.join(process.cwd(), 'app', 'api', 'image-search', 'similarity_runner.py');
    
    // For debugging purposes, check if the script exists
    if (!fs.existsSync(scriptPath)) {
      console.error('Script not found at path:', scriptPath);
      return NextResponse.json(
        { error: 'Image search script not found' },
        { status: 500 }
      );
    }
    
    // Pass the filepath to the base64 data, not the data itself
    const { stdout, stderr } = await execAsync(
      `python "${scriptPath}" "${base64TempFile}" ${topK} ${removeBackground} --file`
    );

    if (stderr) {
      console.log('Python script info:', stderr);
    }

    // Parse the results - expecting JSON output from the Python script
    const similarItems = JSON.parse(stdout.trim());

    // Clean up the temporary files
    try {
      await unlinkAsync(filepath);
      await unlinkAsync(base64TempFile);
    } catch (err) {
      console.error('Failed to delete temporary files:', err);
    }

    return NextResponse.json(similarItems);
  } catch (error) {
    console.error('Error processing DINOv2 image search:', error);
    return NextResponse.json(
      { error: 'Failed to process image search with DINOv2' },
      { status: 500 }
    );
  }
}