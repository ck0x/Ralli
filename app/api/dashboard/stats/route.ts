import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "Store ID required" }, { status: 400 });
    }

    const storeIdNum = parseInt(storeId);

    // Get total orders count
    const totalOrders = await sql`
      SELECT COUNT(*) as count
      FROM jobs
      WHERE store_id = ${storeIdNum}
    `;

    // Get orders by status
    const pendingOrders = await sql`
      SELECT COUNT(*) as count
      FROM jobs
      WHERE store_id = ${storeIdNum} AND status = 'pending'
    `;

    const inProgressOrders = await sql`
      SELECT COUNT(*) as count
      FROM jobs
      WHERE store_id = ${storeIdNum} AND status = 'in-progress'
    `;

    const readyOrders = await sql`
      SELECT COUNT(*) as count
      FROM jobs
      WHERE store_id = ${storeIdNum} AND status = 'ready'
    `;

    // Get completed today
    const completedToday = await sql`
      SELECT COUNT(*) as count
      FROM jobs
      WHERE store_id = ${storeIdNum} 
        AND status = 'picked-up'
        AND DATE(updated_at) = CURRENT_DATE
    `;

    // Get total customers
    const totalCustomers = await sql`
      SELECT COUNT(*) as count
      FROM customers
      WHERE store_id = ${storeIdNum}
    `;

    // Get recent orders
    const recentOrders = await sql`
      SELECT 
        j.id,
        c.full_name as customer_name,
        j.status,
        j.created_at
      FROM jobs j
      JOIN customers c ON c.id = j.customer_id
      WHERE j.store_id = ${storeIdNum}
      ORDER BY j.created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      totalOrders: parseInt(totalOrders[0].count),
      pendingOrders: parseInt(pendingOrders[0].count),
      inProgressOrders: parseInt(inProgressOrders[0].count),
      readyOrders: parseInt(readyOrders[0].count),
      completedToday: parseInt(completedToday[0].count),
      totalCustomers: parseInt(totalCustomers[0].count),
      recentOrders: recentOrders,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
