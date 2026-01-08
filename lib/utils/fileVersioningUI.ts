/**
 * Utility functions for file versioning UI
 */

export interface FileVersion {
  id: number;
  file_url: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_at: string;
  uploaded_by: number | null;
  uploadedBy: {
    id: number;
    username: string;
    email: string;
  } | null;
}

/**
 * Get available versions from file versions array
 */
export const getAvailableVersions = (
  fileVersions: FileVersion[] | undefined,
  versionField: string = 'version'
): string[] => {
  if (!fileVersions || fileVersions.length === 0) {
    return [];
  }
  
  // Extract version field dynamically based on the model type
  const versionKey = versionField as keyof FileVersion;
  const versions = fileVersions.map(fv => {
    // Handle different version field names
    if (versionField === 'process_version') {
      return (fv as any).process_version;
    } else if (versionField === 'document_version') {
      return (fv as any).document_version;
    } else if (versionField === 'objective_version') {
      return (fv as any).objective_version;
    } else if (versionField === 'control_version') {
      return (fv as any).control_version;
    } else if (versionField === 'nc_version') {
      return (fv as any).nc_version;
    } else if (versionField === 'rks_version') {
      return (fv as any).rks_version;
    } else if (versionField === 'improvement_version') {
      return (fv as any).improvement_version;
    } else if (versionField === 'evaluation_version') {
      return (fv as any).evaluation_version;
    } else if (versionField === 'feedback_version') {
      return (fv as any).feedback_version;
    } else if (versionField === 'session_version') {
      return (fv as any).session_version;
    } else if (versionField === 'matrix_version') {
      return (fv as any).matrix_version;
    } else if (versionField === 'assessment_version') {
      return (fv as any).assessment_version;
    }
    return (fv as any)[versionKey] || '';
  });
  
  const uniqueVersions = Array.from(new Set(versions.filter(v => v))).sort();
  return uniqueVersions;
};

/**
 * Get files to display based on selected version filter
 */
export const getFilesToDisplay = <T extends FileVersion>(
  selectedVersion: string,
  currentFile: { file_url?: string; file_name?: string; file_size?: number; file_type?: string } | null | undefined,
  currentVersion: string | undefined,
  fileVersions: T[] | undefined,
  versionField: string = 'version'
): Array<{ version: string; file: T | { file_url?: string; file_name?: string; file_size?: number; file_type?: string } }> => {
  if (selectedVersion === 'all') {
    const allFiles: Array<{ version: string; file: T | { file_url?: string; file_name?: string; file_size?: number; file_type?: string } }> = [];
    
    // Add current file if it exists (only if it's not already in versions)
    if (currentFile?.file_url && currentFile?.file_name) {
      const version = currentVersion || 'Current';
      const versionKey = versionField;
      const isInVersions = fileVersions?.some(fv => {
        const fvVersion = versionField === 'process_version' ? (fv as any).process_version :
                         versionField === 'document_version' ? (fv as any).document_version :
                         versionField === 'objective_version' ? (fv as any).objective_version :
                         versionField === 'control_version' ? (fv as any).control_version :
                         versionField === 'nc_version' ? (fv as any).nc_version :
                         versionField === 'rks_version' ? (fv as any).rks_version :
                         versionField === 'improvement_version' ? (fv as any).improvement_version :
                         versionField === 'evaluation_version' ? (fv as any).evaluation_version :
                         versionField === 'feedback_version' ? (fv as any).feedback_version :
                         versionField === 'session_version' ? (fv as any).session_version :
                         versionField === 'matrix_version' ? (fv as any).matrix_version :
                         versionField === 'assessment_version' ? (fv as any).assessment_version :
                         (fv as any)[versionKey];
        return fv.file_url === currentFile.file_url && fvVersion === version;
      });
      
      if (!isInVersions) {
        allFiles.push({
          version,
          file: currentFile
        });
      }
    }
    
    // Add versioned files
    if (fileVersions) {
      fileVersions.forEach(fv => {
        const fvVersion = versionField === 'process_version' ? (fv as any).process_version :
                         versionField === 'document_version' ? (fv as any).document_version :
                         versionField === 'objective_version' ? (fv as any).objective_version :
                         versionField === 'control_version' ? (fv as any).control_version :
                         versionField === 'nc_version' ? (fv as any).nc_version :
                         versionField === 'rks_version' ? (fv as any).rks_version :
                         versionField === 'improvement_version' ? (fv as any).improvement_version :
                         versionField === 'evaluation_version' ? (fv as any).evaluation_version :
                         versionField === 'feedback_version' ? (fv as any).feedback_version :
                         versionField === 'session_version' ? (fv as any).session_version :
                         versionField === 'matrix_version' ? (fv as any).matrix_version :
                         versionField === 'assessment_version' ? (fv as any).assessment_version :
                         (fv as any)[versionField];
        allFiles.push({
          version: fvVersion || 'Unknown',
          file: fv
        });
      });
    }
    
    // Sort by version (newest first)
    return allFiles.sort((a, b) => {
      if (a.version === 'Current' || a.version === currentVersion) return -1;
      if (b.version === 'Current' || b.version === currentVersion) return 1;
      return b.version.localeCompare(a.version);
    });
  } else if (selectedVersion === 'current') {
    // Show only current file
    if (currentFile?.file_url && currentFile?.file_name) {
      return [{
        version: currentVersion || 'Current',
        file: currentFile
      }];
    }
    return [];
  } else {
    // Show files for specific version
    const versionFiles = fileVersions?.filter(fv => {
      const fvVersion = versionField === 'process_version' ? (fv as any).process_version :
                       versionField === 'document_version' ? (fv as any).document_version :
                       versionField === 'objective_version' ? (fv as any).objective_version :
                       versionField === 'control_version' ? (fv as any).control_version :
                       versionField === 'nc_version' ? (fv as any).nc_version :
                       versionField === 'rks_version' ? (fv as any).rks_version :
                       versionField === 'improvement_version' ? (fv as any).improvement_version :
                       versionField === 'evaluation_version' ? (fv as any).evaluation_version :
                       versionField === 'feedback_version' ? (fv as any).feedback_version :
                       versionField === 'session_version' ? (fv as any).session_version :
                       versionField === 'matrix_version' ? (fv as any).matrix_version :
                       versionField === 'assessment_version' ? (fv as any).assessment_version :
                       (fv as any)[versionField];
      return fvVersion === selectedVersion;
    }) || [];
    
    return versionFiles.map(fv => {
      const fvVersion = versionField === 'process_version' ? (fv as any).process_version :
                       versionField === 'document_version' ? (fv as any).document_version :
                       versionField === 'objective_version' ? (fv as any).objective_version :
                       versionField === 'control_version' ? (fv as any).control_version :
                       versionField === 'nc_version' ? (fv as any).nc_version :
                       versionField === 'rks_version' ? (fv as any).rks_version :
                       versionField === 'improvement_version' ? (fv as any).improvement_version :
                       versionField === 'evaluation_version' ? (fv as any).evaluation_version :
                       versionField === 'feedback_version' ? (fv as any).feedback_version :
                       versionField === 'session_version' ? (fv as any).session_version :
                       versionField === 'matrix_version' ? (fv as any).matrix_version :
                       versionField === 'assessment_version' ? (fv as any).assessment_version :
                       (fv as any)[versionField];
      return {
        version: fvVersion || 'Unknown',
        file: fv
      };
    });
  }
};

