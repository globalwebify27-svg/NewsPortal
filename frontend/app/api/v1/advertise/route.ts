import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_FILE = path.join(process.cwd(), "ad_proposals_db.json");

interface AdProposal {
  id: string;
  brandName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  cityState: string;
  adType: string;
  campaignDetails: string;
  status: "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED";
  submittedAt: string;
}

function getStoredProposals(): AdProposal[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Default sample proposals if empty
      const sampleProposals: AdProposal[] = [
        {
          id: "prop_sample_1",
          brandName: "Acme Retailers Bihar",
          contactPerson: "Rajesh Kumar",
          mobileNumber: "+91 75639 01100",
          email: "rajesh@acme.com",
          cityState: "Ranchi, Jharkhand ",
          adType: "Homepage Leaderboard Banner",
          campaignDetails: "Diwali Special Retail Promotion Campaign for 15 Days.",
          status: "PENDING",
          submittedAt: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(sampleProposals, null, 2), "utf-8");
      return sampleProposals;
    }
    const fileData = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(fileData) as AdProposal[];
  } catch (err) {
    console.error("Error reading ad proposals storage:", err);
    return [];
  }
}

function saveProposals(proposals: AdProposal[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(proposals, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving ad proposals storage:", err);
  }
}

// GET /api/v1/advertise -> Admin lists all received advertising proposal inquiries
export async function GET(request: NextRequest) {
  try {
    const proposals = getStoredProposals();
    return NextResponse.json({
      success: true,
      data: proposals,
      total: proposals.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch proposals", data: [] },
      { status: 500 }
    );
  }
}

// POST /api/v1/advertise -> Public form submit from /advertise page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandName, contactPerson, mobileNumber, email, cityState, adType, campaignDetails } = body;

    if (!brandName || !contactPerson || !mobileNumber) {
      return NextResponse.json(
        { success: false, message: "Brand Name, Contact Person, and Mobile Number are required." },
        { status: 400 }
      );
    }

    const proposals = getStoredProposals();
    const newProposal: AdProposal = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      brandName: String(brandName).trim(),
      contactPerson: String(contactPerson).trim(),
      mobileNumber: String(mobileNumber).trim(),
      email: String(email || "").trim(),
      cityState: String(cityState || "").trim(),
      adType: String(adType || "General Inquiry").trim(),
      campaignDetails: String(campaignDetails || "").trim(),
      status: "PENDING",
      submittedAt: new Date().toISOString()
    };

    proposals.unshift(newProposal);
    saveProposals(proposals);

    return NextResponse.json({
      success: true,
      data: newProposal,
      message: "🎉 Proposal inquiry submitted successfully! Our ad team will contact you shortly."
    });
  } catch (error: any) {
    console.error("Error submitting ad proposal:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/advertise -> Admin updates proposal status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Proposal ID and status are required." },
        { status: 400 }
      );
    }

    let proposals = getStoredProposals();
    let found = false;

    proposals = proposals.map((p) => {
      if (p.id === id) {
        found = true;
        return { ...p, status };
      }
      return p;
    });

    if (!found) {
      return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });
    }

    saveProposals(proposals);

    return NextResponse.json({
      success: true,
      message: `Proposal status updated to ${status}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/advertise?id=... -> Admin deletes proposal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Proposal ID required" }, { status: 400 });
    }

    let proposals = getStoredProposals();
    proposals = proposals.filter((p) => p.id !== id);
    saveProposals(proposals);

    return NextResponse.json({
      success: true,
      message: "Proposal inquiry deleted successfully."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
