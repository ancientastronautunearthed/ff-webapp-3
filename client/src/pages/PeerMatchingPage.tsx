import React from 'react';
import { Layout } from '@/components/Layout';
import { PeerMatching } from '@/components/PeerMatching';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { Link } from 'wouter';

export default function PeerMatchingPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/community">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              Peer Matching
            </h1>
            <p className="text-gray-600 mt-2">
              Connect with others who understand your journey and can provide mutual support
            </p>
          </div>
        </div>

        <PeerMatching />
      </div>
    </Layout>
  );
}