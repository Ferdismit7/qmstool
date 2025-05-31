import prisma from '@/lib/prisma';
import { BusinessProcessRegisterInput } from './types/businessProcessRegister';

export async function getAllBusinessProcesses() {
  const processes = await prisma.businessProcessRegister.findMany({
    orderBy: {
      id: 'desc'
    }
  });

  // Map the snake_case database fields to camelCase for frontend
  return processes.map(process => ({
    id: process.id,
    businessArea: process.business_area || '',
    subBusinessArea: process.sub_business_area || '',
    processName: process.process_name || '',
    documentName: process.document_name || '',
    version: process.version || '',
    progress: process.progress || '',
    status: process.doc_status || '',
    statusPrecentage: Number(process.status_precentage) || 0,
    priority: process.priority || '',
    targetDate: process.target_date ? new Date(process.target_date) : null,
    processOwner: process.process_owner || '',
    updateDate: process.update_date ? new Date(process.update_date) : null,
    remarks: process.remarks || '',
    reviewDate: process.review_date ? new Date(process.review_date) : null
  }));
}

export async function getBusinessProcessById(id: number) {
  const process = await prisma.businessProcessRegister.findUnique({
    where: { id }
  });

  if (!process) return null;

  return {
    id: process.id,
    businessArea: process.business_area || '',
    subBusinessArea: process.sub_business_area || '',
    processName: process.process_name || '',
    documentName: process.document_name || '',
    version: process.version || '',
    progress: process.progress || '',
    status: process.doc_status || '',
    statusPrecentage: Number(process.status_precentage) || 0,
    priority: process.priority || '',
    targetDate: process.target_date ? new Date(process.target_date) : null,
    processOwner: process.process_owner || '',
    updateDate: process.update_date ? new Date(process.update_date) : null,
    remarks: process.remarks || '',
    reviewDate: process.review_date ? new Date(process.review_date) : null
  };
}

export async function createBusinessProcess(data: BusinessProcessRegisterInput) {
  try {
    // Format dates to ISO strings if they are Date objects
    const formattedData = {
      business_area: data.businessArea || '',
      sub_business_area: data.subBusinessArea || '',
      process_name: data.processName || '',
      document_name: data.documentName || '',
      version: data.version || '',
      progress: data.progress || '',
      doc_status: data.docStatus || '',
      status_precentage: Number(data.statusPrecentage) || 0,
      priority: data.priority || '',
      target_date: data.targetDate ? new Date(data.targetDate).toISOString() : null,
      process_owner: data.processOwner || '',
      review_date: data.reviewDate ? new Date(data.reviewDate).toISOString() : null,
      update_date: new Date().toISOString(),
      remarks: data.remarks || ''
    };

    const result = await prisma.businessProcessRegister.create({
      data: formattedData
    });
    return result.id;
  } catch (error) {
    console.error('Error creating business process:', error);
    throw error;
  }
}

export async function updateBusinessProcess(id: number, data: Partial<BusinessProcessRegisterInput>) {
  try {
    // Format dates to ISO strings if they are Date objects
    const formattedData = {
      business_area: data.businessArea,
      sub_business_area: data.subBusinessArea,
      process_name: data.processName,
      document_name: data.documentName,
      version: data.version,
      progress: data.progress,
      doc_status: data.docStatus,
      status_precentage: data.statusPrecentage,
      priority: data.priority,
      target_date: data.targetDate instanceof Date ? data.targetDate.toISOString() : data.targetDate,
      process_owner: data.processOwner,
      review_date: data.reviewDate instanceof Date ? data.reviewDate.toISOString() : data.reviewDate,
      update_date: new Date().toISOString(),
      remarks: data.remarks
    };

    // Remove undefined values
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key as keyof typeof formattedData] === undefined) {
        delete formattedData[key as keyof typeof formattedData];
      }
    });

    const result = await prisma.businessProcessRegister.update({
      where: { id },
      data: formattedData
    });
    return !!result;
  } catch (error) {
    console.error('Error updating business process:', error);
    throw error;
  }
}

export async function deleteBusinessProcess(id: number) {
  const result = await prisma.businessProcessRegister.delete({
    where: { id }
  });
  return !!result;
}

export async function searchBusinessProcesses(searchTerm: string) {
  const processes = await prisma.businessProcessRegister.findMany({
    where: {
      OR: [
        { business_area: { contains: searchTerm } },
        { sub_business_area: { contains: searchTerm } },
        { process_name: { contains: searchTerm } },
        { document_name: { contains: searchTerm } }
      ]
    }
  });

  return processes.map(process => ({
    id: process.id,
    businessArea: process.business_area || '',
    subBusinessArea: process.sub_business_area || '',
    processName: process.process_name || '',
    documentName: process.document_name || '',
    version: process.version || '',
    progress: process.progress || '',
    status: process.doc_status || '',
    statusPrecentage: Number(process.status_precentage) || 0,
    priority: process.priority || '',
    targetDate: process.target_date ? new Date(process.target_date) : null,
    processOwner: process.process_owner || '',
    updateDate: process.update_date ? new Date(process.update_date) : null,
    remarks: process.remarks || '',
    reviewDate: process.review_date ? new Date(process.review_date) : null
  }));
} 