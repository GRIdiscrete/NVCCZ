// app/single_fund/actions.ts
'use server'

import axios from "axios";

export async function createFund(
  prevState: { success: boolean; message: string } | null,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      fund_name: formData.get('fund_name'),
      value: Number(formData.get('value')),
      commencement: formData.get('commencement'),
      sector: formData.get('sector')
    };

    const response = await axios.post(
      'http://34.59.74.22/api/method/create-fund',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from('911d30d72104ac4:6ae9a0b0eb015e1').toString('base64'),
          'Accept': 'application/json'
        }
      }
    );

    return { success: true, message: 'Fund created successfully!' };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export async function getFunds() {
  try {
    const response = await axios.get(
      'http://34.59.74.22/api/method/fund',
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from('911d30d72104ac4:6ae9a0b0eb015e1').toString('base64'),
          'Accept': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching funds:', error);
    return { data: [] };
  }
}