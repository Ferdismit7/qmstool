import type { BusinessProcess, BusinessProcessRegisterInput } from '../types/businessProcess';
import { API_ENDPOINTS } from '../types/businessProcess';

class BusinessProcessService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'An error occurred');
    }
    return response.json();
  }

  async fetchAll(): Promise<BusinessProcess[]> {
    const response = await fetch(API_ENDPOINTS.BUSINESS_PROCESSES);
    return this.handleResponse<BusinessProcess[]>(response);
  }

  async save(data: BusinessProcessRegisterInput, id?: number): Promise<BusinessProcess> {
    const url = id 
      ? `${API_ENDPOINTS.BUSINESS_PROCESSES}?id=${id}`
      : API_ENDPOINTS.BUSINESS_PROCESSES;

    const response = await fetch(url, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<any>(response);
    
    // For PUT requests, construct the response in the expected format
    if (id) {
      return {
        id: id.toString(),
        businessArea: data.businessArea || '',
        subBusinessArea: data.subBusinessArea || '',
        processName: data.processName || '',
        documentName: data.documentName || '',
        version: data.version || '',
        progress: data.progress || '',
        status: data.docStatus || '',
        statusPrecentage: data.statusPrecentage || 0,
        priority: data.priority || 'Low',
        targetDate: data.targetDate instanceof Date ? data.targetDate.toISOString().split('T')[0] : data.targetDate || '',
        processOwner: data.processOwner || '',
        updateDate: new Date().toISOString().split('T')[0],
        remarks: data.remarks || '',
        reviewDate: data.reviewDate instanceof Date ? data.reviewDate.toISOString().split('T')[0] : data.reviewDate || '',
      };
    }

    return result;
  }
}

export default new BusinessProcessService(); 