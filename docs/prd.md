# Requirements Document

## 1. Application Overview

**Application Name**: LinkedIn Ads Campaign Manager Replica

**Description**: A professional advertising dashboard application for managing ad campaigns, replicating LinkedIn's Ads Campaign Manager interface with full functionality for campaign creation, monitoring, and optimization.

## 2. Users and Usage Scenarios

**Target Users**: Digital marketing professionals, advertising managers, business owners managing LinkedIn advertising campaigns

**Core Usage Scenarios**:
- Monitor and manage multiple advertising campaigns
- Analyze campaign performance metrics
- Pause/resume campaigns based on performance
- Filter and compare campaign data across time periods
- Export campaign reports for analysis

## 3. Page Structure and Functionality

### 3.1 Page Hierarchy

```
Main Application
├── Header (Global)
├── Left Sidebar Navigation
└── Main Content Area
    ├── Campaigns Dashboard (Default)
    ├── Campaign Detail Page
    ├── Ad Sets Management
    ├── Ads Management
    └── Create Campaign Flow
```

### 3.2 Header Section

**Components**:
- Logo/branding display on the left
- Account selector dropdown showing account name (e.g., \"Redington MENA\") with active status indicator
- Right-side icons: Notifications (bell icon), Help (question mark icon), User profile (avatar)

**Functionality**:
- Account selector allows switching between different advertising accounts
- Notification icon displays alerts and updates
- Help icon provides access to support resources
- User profile icon opens account settings menu

### 3.3 Left Sidebar Navigation

**Navigation Items**:
- Overview
- Plan
- Advertise
- Measure
- Recommendations
- Content & assets
- Billing
- Account settings
- Company page (with external link icon)

**Functionality**:
- Collapsible sidebar to maximize content area
- Active state styling for current page
- Expandable/collapsible arrows for items with nested submenus
- Click navigation item to switch between different sections

### 3.4 Campaigns Dashboard (Main View)

#### 3.4.1 Tab Navigation

**Tabs**:
- Campaigns (default active)
- Ad sets
- Ads

**Functionality**:
- Display active tab with underline styling
- Show badge indicators for counts (e.g., \"1 selected\", \"1 total\")
- Switch between different management views

#### 3.4.2 Toolbar & Action Controls

**Buttons**:
- \"Create\" button (primary action with dropdown arrow)
- \"Bulk actions\" dropdown button
- Delete/trash icon button
- \"Performance chart\" button
- \"Professional demographics\" button
- \"Export\" button

**Functionality**:
- Create button opens campaign creation flow
- Bulk actions dropdown shows options when campaigns are selected (pause, resume, delete, duplicate)
- Delete button removes selected campaigns
- Performance chart button displays visual analytics
- Professional demographics button shows audience insights
- Export button downloads campaign data

#### 3.4.3 Filter & Search Section

**Components**:
- Search box with placeholder \"Search by name or ID\"
- \"Filters\" dropdown button with active indicator
- \"Columns\" selector (Performance, Breakdown options)
- Time range picker showing date range (format: M/D/YYYY - M/D/YYYY) with dropdown
- \"Compare\" dropdown (options: Previous period, Custom date range)
- \"Period range\" showing comparison date range with dropdown

**Functionality**:
- Search box filters campaigns by name or ID in real-time
- Filters dropdown allows filtering by status, campaign type, objective
- Columns selector customizes visible table columns
- Time range picker selects data display period using calendar interface
- Compare dropdown enables period-over-period comparison
- Period range automatically calculates based on comparison selection

#### 3.4.4 Campaign Table

**Table Columns**:
1. Checkbox (select all in header)
2. Campaign name (clickable, with ID and campaign type/description below)
3. Off/On toggle switch
4. Status (with status badge)
5. Spent (currency format)
6. Impressions (number)
7. Clicks (number with sortable header)

**Row Structure**:
- Checkbox for multi-select
- Campaign name (bold, larger font) with campaign ID
- Subtext showing campaign objective/type (e.g., \"Lead Generation\", \"Brand Awareness\")
- Toggle switch displaying on/off state
- Status badge with color coding (Active: green #31A24C, Paused: gray #A8ADBB)
- Numeric metrics (spent, impressions, clicks) right-aligned

**Table Functionality**:
- Click column header to sort ascending/descending
- Hover effect on rows
- Toggle switch pauses/resumes individual campaigns
- Checkbox selection for bulk operations
- Click campaign name to open Campaign Detail Page
- Visual highlight for selected rows
- Display 3-5 sample campaigns with different statuses and metrics

### 3.5 Campaign Detail Page

**Functionality**:
- Display comprehensive campaign information
- Show detailed performance metrics
- Allow campaign settings modification
- Provide access to associated ad sets and ads

### 3.6 Ad Sets Management

**Functionality**:
- List all ad sets within campaigns
- Manage ad set targeting and budgets
- Monitor ad set performance

### 3.7 Ads Management

**Functionality**:
- Display individual ads
- Edit ad creative and copy
- Track ad-level metrics

### 3.8 Create Campaign Flow

**Functionality**:
- Guide user through campaign creation steps
- Set campaign objective
- Define targeting parameters
- Set budget and schedule
- Create initial ad sets and ads

## 4. Business Rules and Logic

### 4.1 Campaign Selection Logic

- Individual campaign selection via row checkbox
- \"Select all\" checkbox in table header selects/deselects all visible campaigns
- Selected count updates in tab badge
- Bulk actions dropdown activates only when one or more campaigns selected
- Selection clears when navigating away or completing bulk action

### 4.2 Campaign Status Management

- Toggle switch changes campaign status between Active and Paused
- Status badge updates immediately upon toggle
- Active campaigns display green status badge (#31A24C)
- Paused campaigns display gray status badge (#A8ADBB)
- Status change reflects in metrics calculation

### 4.3 Date Range and Comparison Logic

- Default time range: 5/7/2026 - 6/5/2026 (30 days)
- Comparison period automatically calculates as equal-length period before selected range
- Example: Selected period 5/7/2026 - 6/5/2026, comparison period 4/7/2026 - 5/6/2026
- Custom comparison allows manual date range selection
- Metrics display for both current and comparison periods

### 4.4 Search and Filter Logic

- Search matches campaign name or campaign ID
- Case-insensitive search
- Results update as user types
- Multiple filters combine with AND logic
- Active filters show indicator badge on Filters button
- Clear filters option resets to default view

### 4.5 Sorting Logic

- Click column header to sort by that column
- First click: ascending order
- Second click: descending order
- Third click: return to default order
- Sort indicator (arrow) displays in active column header

### 4.6 Data Export Logic

- Export includes all campaigns matching current filters
- Export respects selected date range
- File format: CSV
- Exported columns match visible table columns
- File name format: campaigns_export_YYYYMMDD.csv

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| No campaigns exist | Display empty state message with \"Create\" button |
| Search returns no results | Show \"No campaigns found\" message with option to clear search |
| All campaigns selected then filtered | Maintain selection only for visible campaigns |
| Toggle switch clicked during status update | Disable toggle until previous update completes |
| Export with no campaigns selected | Export all campaigns matching current filters |
| Date range picker: end date before start date | Prevent selection, show validation message |
| Network error during data fetch | Display error message with retry option |
| Bulk action on mixed status campaigns | Apply action to all selected campaigns |

## 6. Acceptance Criteria

1. User logs into the application and lands on Campaigns Dashboard showing campaign table with 3-5 sample campaigns
2. User selects one campaign using checkbox, then clicks \"Bulk actions\" dropdown and selects \"Pause\"
3. Selected campaign status changes to \"Paused\" with gray badge, toggle switch moves to off position
4. User enters campaign name in search box, table filters to show only matching campaigns
5. User clicks time range picker, selects new date range (6/1/2026 - 6/25/2026), table data updates to reflect new period
6. User clicks \"Export\" button, CSV file downloads containing current campaign data
7. User clicks campaign name in table, navigates to Campaign Detail Page showing comprehensive campaign information

## 7. Out of Scope for This Release

- Advanced analytics and reporting dashboards
- A/B testing functionality
- Automated campaign optimization rules
- Integration with external analytics platforms
- Multi-user collaboration features
- Campaign templates library
- Audience insights and recommendations engine
- Budget forecasting and pacing tools
- Creative asset library management
- Conversion tracking setup
- API access for third-party integrations
- White-label customization options
- Mobile native applications (iOS/Android)
- Real-time bidding adjustments
- Competitor analysis features