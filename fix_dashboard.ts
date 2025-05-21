import * as fs from 'fs';

// Read the file
const filePath = 'client/src/pages/EmployerDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the applications tab section
const startMarker = '{/* Applications Tab */}';
const endMarker = '{/* Company Profile Tab */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  // Create a fixed version of the applications tab
  const fixedApplicationsTab = `${startMarker}
                <TabsContent value="applications">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl font-heading">Applications</CardTitle>
                          <CardDescription>
                            Manage candidates and track their application progress
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            <span>Export</span>
                          </Button>
                          <Button size="sm" className="flex items-center gap-1 bg-[#0A3D62] hover:bg-[#082C46]">
                            <Mail className="h-4 w-4" />
                            <span>Email Selected</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative w-full md:w-1/3">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                          <Input 
                            placeholder="Search candidates..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            className="border rounded-md px-3 py-2 text-sm bg-white w-full md:w-auto"
                            value={jobFilter === "all" ? "all" : jobFilter.toString()}
                            onChange={(e) => setJobFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                          >
                            <option value="all">All Jobs</option>
                            {jobs.map(job => (
                              <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <Tabs defaultValue="all">
                        <TabsList className="mb-4">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="applied">New</TabsTrigger>
                          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                          <TabsTrigger value="interview_scheduled">Interview</TabsTrigger>
                          <TabsTrigger value="hired">Hired</TabsTrigger>
                          <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                          {isLoadingApplications ? (
                            <div className="space-y-4">
                              {[1, 2, 3].map((_, i) => (
                                <div key={i} className="h-24 animate-pulse bg-neutral-100 rounded-md"></div>
                              ))}
                            </div>
                          ) : applications.length > 0 ? (
                            <div className="space-y-4">
                              <div className="overflow-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b text-left">
                                      <th className="px-4 py-3 font-medium">Candidate</th>
                                      <th className="px-4 py-3 font-medium">Position</th>
                                      <th className="px-4 py-3 font-medium">Applied Date</th>
                                      <th className="px-4 py-3 font-medium">Status</th>
                                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                    {applications
                                      .filter(app => 
                                        (jobFilter === 'all' || app.jobId === jobFilter) &&
                                        (searchQuery === '' || 
                                         app.applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                         app.applicant.email.toLowerCase().includes(searchQuery.toLowerCase()))
                                      )
                                      .map((application) => (
                                      <tr key={application.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-4">
                                          <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage src={application.applicant.profilePicture} alt={application.applicant.fullName} />
                                              <AvatarFallback className="bg-neutral-200 text-neutral-700 text-xs">
                                                {application.applicant.fullName.split(' ').map(n => n[0]).join('')}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium">{application.applicant.fullName}</p>
                                              <p className="text-xs text-neutral-500">{application.applicant.email}</p>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-4">
                                          {application.job.title}
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600">
                                          {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-4 py-4">
                                          <select 
                                            className={\`text-xs py-1 px-2 rounded border \${
                                              application.status === 'applied' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                                              application.status === 'reviewed' ? 'bg-purple-50 border-purple-200 text-purple-700' : 
                                              application.status === 'interview_scheduled' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                                              application.status === 'hired' ? 'bg-green-50 border-green-200 text-green-700' : 
                                              'bg-red-50 border-red-200 text-red-700'
                                            }\`}
                                            defaultValue={application.status}
                                            onChange={(e) => {
                                              toast({
                                                title: "Status Updated",
                                                description: \`\${application.applicant.fullName}'s application status updated to \${e.target.value.replace('_', ' ')}\`,
                                              });
                                            }}
                                          >
                                            <option value="applied">Applied</option>
                                            <option value="reviewed">Reviewed</option>
                                            <option value="interview_scheduled">Interview</option>
                                            <option value="hired">Hired</option>
                                            <option value="rejected">Rejected</option>
                                          </select>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem>
                                                <Eye className="h-4 w-4 mr-2" />
                                                <span>View Resume</span>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <Calendar className="h-4 w-4 mr-2" />
                                                <span>Schedule Interview</span>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <Mail className="h-4 w-4 mr-2" />
                                                <span>Email Candidate</span>
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem>
                                                <ThumbsUp className="h-4 w-4 mr-2" />
                                                <span>Move to Hired</span>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                <span>Reject</span>
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                
                                <div className="flex items-center justify-between py-4 mt-4">
                                  <p className="text-sm text-neutral-500">
                                    Showing <span className="font-medium">{applications.length}</span> applications
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm" disabled>Previous</Button>
                                    <Button variant="outline" size="sm" disabled>Next</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12 text-neutral-500">
                              <FileText className="h-10 w-10 mx-auto mb-4 text-neutral-300" />
                              <p>No applications received yet</p>
                              <p className="text-sm text-neutral-400">Applications to your job listings will appear here</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="applied">
                          <div className="text-center py-4">
                            <p className="text-sm text-neutral-500">Showing applications with "Applied" status</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="reviewed">
                          <div className="text-center py-4">
                            <p className="text-sm text-neutral-500">Showing applications with "Reviewed" status</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="interview_scheduled">
                          <div className="text-center py-4">
                            <p className="text-sm text-neutral-500">Showing applications with "Interview" status</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="hired">
                          <div className="text-center py-4">
                            <p className="text-sm text-neutral-500">Showing applications with "Hired" status</p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="rejected">
                          <div className="text-center py-4">
                            <p className="text-sm text-neutral-500">Showing applications with "Rejected" status</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>

                `;

  // Replace the section with the fixed version
  const newContent = content.substring(0, startIndex) + fixedApplicationsTab + content.substring(endIndex);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Fixed EmployerDashboard.tsx');
} else {
  console.error('Could not find the section to replace');
}
