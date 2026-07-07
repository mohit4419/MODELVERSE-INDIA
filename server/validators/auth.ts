import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
  phone_number: z.string().optional().refine(val => {
    if (!val) return true;
    // Standard E.164 phone validation: Optional +, followed by 7 to 15 digits
    const cleanNum = val.trim().replace(/[\s-()]/g, '');
    return /^\+?[1-9]\d{6,14}$/.test(cleanNum);
  }, {
    message: 'Invalid phone number format. Please provide a valid number containing 7 to 15 digits.'
  })
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required.' }),
  password: z.string().min(1, { message: 'Password is required.' })
});
