declare const Deno: any;

declare module "npm:razorpay" {
  const Razorpay: any;
  export default Razorpay;
}

declare module "@supabase/server" {
  export function createClient(url: string, key: string): any;
}

declare module "@supabase/functions-js" {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}
