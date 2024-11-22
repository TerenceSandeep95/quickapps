export interface Screenshot {
  file: File;
  preview: string;
  text1: string;
  text2: string;
}

export interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  screenshots: Screenshot[];
}

export interface TextStyle {
  fontFamily: string;
  fontWeight: string;
  color: string;
}