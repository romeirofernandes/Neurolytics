import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import ParticipantSidebar from '../../components/participant/ParticipantSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  FaBrain, FaBullseye, FaBolt, FaLayerGroup, FaPuzzlePiece, 
  FaFilter, FaHandPaper, FaSyncAlt, FaArrowsAlt, FaHashtag, 
  FaSearch, FaCamera, FaClock, FaTrophy, FaBook, 
  FaArrowRight, FaChartLine
} from 'react-icons/fa';
import { Search } from 'lucide-react';
import templatesData from '../../../templates.json';

// Icon mapping for templates
const iconMap = {
  Brain: FaBrain,
  Target: FaBullseye,
  Zap: FaBolt,
  Layers: FaLayerGroup,
  Puzzle: FaPuzzlePiece,
  Filter: FaFilter,
  Hand: FaHandPaper,
  RefreshCw: FaSyncAlt,
  Move: FaArrowsAlt,
  Hash: FaHashtag,
  Search: FaSearch,
  Camera: FaCamera
};

const ParticipantExplore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories
  const categories = ['all', ...new Set(templatesData.map(t => t.category))];

  // Filter templates based on search and category
  const filteredTemplates = templatesData.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch(difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <ParticipantSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Explore Experiments
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Discover and participate in psychological research experiments
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Available Experiments</p>
                      <p className="text-2xl font-bold">{templatesData.length}</p>
                    </div>
                    <FaBook className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Research Areas</p>
                      <p className="text-2xl font-bold">{categories.length - 1}</p>
                    </div>
                    <FaChartLine className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Duration</p>
                      <p className="text-2xl font-bold">~2 min</p>
                    </div>
                    <FaClock className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search experiments by name, keyword, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredTemplates.length} of {templatesData.length} experiments
            </div>

            {/* Templates Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => {
                const Icon = iconMap[template.icon] || FaBrain;
                return (
                  <Card 
                    key={template.id}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                    onClick={() => navigate(`/participant/experiment/${template.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getDifficultyColor(template.difficulty)}
                        >
                          {template.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {template.fullName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.shortDescription}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FaClock className="h-3 w-3" />
                          {template.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <FaTrophy className="h-3 w-3" />
                          {template.trials}
                        </div>
                      </div>

                      {template.requiresCamera && (
                        <Badge variant="secondary" className="text-xs">
                          <FaCamera className="h-3 w-3 mr-1" />
                          Camera Required
                        </Badge>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs font-medium text-muted-foreground">
                          {template.category}
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="group-hover:text-primary"
                        >
                          View Details
                          <FaArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* No Results */}
            {filteredTemplates.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FaFilter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No experiments found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ParticipantExplore;
