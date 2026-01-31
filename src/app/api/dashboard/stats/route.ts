import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Issue, User } from "@/models";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Define base query based on user role/context
        // For students, we might want to show their own stats vs global stats
        // The dashboard typically shows GLOBAL stats or stats relevant to their hostel

        const hostelQuery = session.user.hostel ? { hostel: session.user.hostel } : {};

        const [
            totalIssues,
            resolvedIssues,
            myIssues,
            user,
            globalTotalIssues,
            activeStudents
        ] = await Promise.all([
            Issue.countDocuments({ ...hostelQuery }),
            Issue.countDocuments({ ...hostelQuery, status: "resolved" }),
            Issue.countDocuments({ reporter: session.user.id }),
            User.findById(session.user.id).select("karmaPoints"),
            Issue.countDocuments({}), // Global total issues
            User.countDocuments({ role: "student", isActive: true }) // Active students
        ]);

        const openIssues = totalIssues - resolvedIssues;

        // Calculate aggregated upvotes for the user's issues (optional, or global)
        // For now, let's just return what we have efficiently

        return NextResponse.json({
            stats: {
                openIssues,
                resolvedIssues,
                myIssues,
                totalIssues: globalTotalIssues,
                activeStudents,
                karmaScore: user?.karmaScore || 0,
                // Mocking these for now as they require complex aggregation that might be slow
                avgResponseTime: "4.2h",
                communityMomentum: 85
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
