import React from 'react';
import { Layout } from '@/components/Layout';
import { CommunityRewards } from '@/components/CommunityRewards';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function CommunityRewardsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/community">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Rewards</h1>
            <p className="text-gray-600 mt-2">
              Earn badges and points for helping others in our community
            </p>
          </div>
        </div>

        <CommunityRewards />
      </div>
    </Layout>
  );
}