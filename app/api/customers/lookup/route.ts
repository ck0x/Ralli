import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/neonDb";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const storeId = req.nextUrl.searchParams.get("storeId");

  if (!email || !storeId) {
    return NextResponse.json(
      { error: "email and storeId are required" },
      { status: 400 }
    );
  }

  try {
    // Find customer by email and store
    const customers = await sql`
      SELECT id, full_name, contact_number, email, created_at
      FROM customers
      WHERE email = ${email.toLowerCase().trim()}
        AND store_id = ${parseInt(storeId)}
      LIMIT 1
    `;

    if (!customers || customers.length === 0) {
      return NextResponse.json({
        exists: false,
        customer: null,
        recentOrders: [],
      });
    }

    const customer = customers[0];

    // Fetch recent orders for this customer
    const recentOrders = await sql`
      SELECT 
        j.id,
        j.service_type,
        j.additional_notes,
        j.created_at,
        r.brand as racket_brand,
        r.model as racket_model,
        r.string_type
      FROM jobs j
      LEFT JOIN rackets r ON r.id = j.racket_id
      WHERE j.customer_id = ${customer.id}
        AND j.store_id = ${parseInt(storeId)}
      ORDER BY j.created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      exists: true,
      customer: {
        id: customer.id,
        name: customer.full_name,
        phone: customer.contact_number,
        email: customer.email,
        memberSince: customer.created_at,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        racketBrand: order.racket_brand,
        racketModel: order.racket_model,
        stringType: order.string_type,
        serviceType: order.service_type,
        notes: order.additional_notes,
        date: order.created_at,
      })),
    });
  } catch (error: any) {
    console.error("Customer lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup customer" },
      { status: 500 }
    );
  }
}
