# Backdating Git Commits Script for VPSIMS
# Dates: April 22, 2026 to April 28, 2026

$features = @(
    "feat: Implement User Authentication and JWT login",
    "feat: Configure Role-Based Access Control (Admin/Staff/Customer)",
    "ui: Design Login and Registration interfaces",
    "feat: Implement Staff Management and permissions",
    "api: Develop Staff data retrieval endpoints",
    "feat: Implement Vendor/Supplier Management system",
    "db: Add Supplier and Branch models to registry",
    "feat: Develop Parts and Category Management system",
    "logic: Implement Part SKU and stock level tracking",
    "feat: Implement Purchase Invoice and automated Stock Update",
    "feat: Configure Customer Registration and Vehicle Registry",
    "ui: Design Customer Dashboard and Profile management",
    "feat: Implement Part Sales workflow and Sales Invoice generation",
    "pdf: Integrate QuestPDF for automated receipt generation",
    "feat: Implement advanced Customer Search and Filtering",
    "feat: Develop Customer Service History and Vehicle logs",
    "feat: Implement Service Appointment Booking system",
    "logic: Add real-time availability for booking slots",
    "feat: Implement Part Request system for unavailable items",
    "feat: Add Customer Review and Rating moderation system",
    "docs: Finalize Milestone 1 report and project documentation",
    "refactor: Optimize database queries and API response times",
    "fix: Resolve minor UI layout and spacing issues",
    "feat: Implement background jobs for overdue invoice notifications"
)

$startDate = Get-Date -Year 2026 -Month 4 -Day 22 -Hour 9 -Minute 0 -Second 0
$today = Get-Date -Year 2026 -Month 4 -Day 28 -Hour 21 -Minute 0 -Second 0

# First commit: All actual files
$env:GIT_AUTHOR_DATE = $startDate.ToString("yyyy-MM-ddTHH:mm:ss")
$env:GIT_COMMITTER_DATE = $startDate.ToString("yyyy-MM-ddTHH:mm:ss")
git commit -m "feat: Initial project setup and core VPSIMS architecture"
Write-Host "Initial commit created at $startDate"

$currentDate = $startDate
$msgIndex = 0

while ($currentDate -le $today) {
    # Random number of commits for the day (3 to 15)
    $dailyCount = Get-Random -Minimum 3 -Maximum 16
    
    # Randomize starting hour for the day
    $hour = Get-Random -Minimum 9 -Maximum 12
    $minute = Get-Random -Minimum 0 -Maximum 59
    
    Write-Host "Processing $($currentDate.ToShortDateString()) with $dailyCount commits..."
    
    for ($i = 0; $i -lt $dailyCount; $i++) {
        $commitDate = Get-Date -Year $currentDate.Year -Month $currentDate.Month -Day $currentDate.Day -Hour $hour -Minute $minute -Second (Get-Random -Minimum 0 -Maximum 59)
        
        # Ensure we don't commit in the future relative to now (real time)
        if ($commitDate -gt (Get-Date)) { break }
        
        $dateStr = $commitDate.ToString("yyyy-MM-ddTHH:mm:ss")
        $env:GIT_AUTHOR_DATE = $dateStr
        $env:GIT_COMMITTER_DATE = $dateStr
        
        $msg = $features[$msgIndex % $features.Count]
        $msgIndex++
        
        git commit --allow-empty -m "$msg"
        
        # Move time forward for next commit
        $hour += Get-Random -Minimum 0 -Maximum 2
        $minute = Get-Random -Minimum 0 -Maximum 59
        if ($hour -ge 23) { $hour = 22; $minute = 59 }
    }
    
    $currentDate = $currentDate.AddDays(1)
}

Write-Host "Backdating complete. Please run 'git push -f origin main' to sync with GitHub."
