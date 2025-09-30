// Audio utilities for voice processing
export class AudioConverter {
  /**
   * Convert WebM audio to WAV format
   */
  static async convertWebMToWav(webmBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert to mono if stereo
          const channelData = audioBuffer.getChannelData(0);
          
          // Create WAV file
          const wavBuffer = this.encodeWAV(channelData, audioBuffer.sampleRate);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          
          resolve(wavBlob);
        } catch (error) {
          console.error('Error converting audio:', error);
          // If conversion fails, return original blob
          resolve(webmBlob);
        }
      };
      
      fileReader.onerror = () => {
        reject(new Error('Failed to read audio file'));
      };
      
      fileReader.readAsArrayBuffer(webmBlob);
    });
  }

  /**
   * Encode Float32Array as WAV
   */
  private static encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }
    
    return buffer;
  }

  /**
   * Get optimal media recorder options
   */
  static getRecorderOptions(): MediaRecorderOptions {
    // Try different mime types for better compatibility
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ];
    
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return { mimeType };
      }
    }
    
    return {}; // Use default
  }

  /**
   * Check if getUserMedia is supported
   */
  static isSupported(): boolean {
    try {
      return !!(
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function' &&
        typeof window !== 'undefined' &&
        typeof window.MediaRecorder === 'function'
      );
    } catch {
      return false;
    }
  }
}