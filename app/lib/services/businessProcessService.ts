import type { BusinessProcessRegister, BusinessProcessRegisterInput } from '@/lib/types/businessProcessRegister';
import { API_ENDPOINTS } from '../types/businessProcess';

class BusinessProcessService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'An error occurred');
    }
    return response.json();
  }

  async fetchAll(): Promise<BusinessProcessRegister[]> {
    const response = await fetch(API_ENDPOINTS.BUSINESS_PROCESSES);
    return this.handleResponse<BusinessProcessRegister[]>(response);
  }

  async save(data: BusinessProcessRegisterInput, id?: number): Promise<BusinessProcessRegister> {
    const url = id 
      ? `${API_ENDPOINTS.BUSINESS_PROCESSES}/${id}`
      : API_ENDPOINTS.BUSINESS_PROCESSES;

    const response = await fetch(url, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return this.handleResponse<BusinessProcessRegister>(response);
  }
}

const businessProcessService = new BusinessProcessService();
export default businessProcessService; 