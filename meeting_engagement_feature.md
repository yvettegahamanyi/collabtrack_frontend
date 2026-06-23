# group Meeting analysis requirements

## What the Instructor/Group Owner Needs

For each group meeting, the instructor uploads exactly three files:

| File               | Format | Used To Calculate                        |
| ------------------ | ------ | ---------------------------------------- |
| Attendance list    | `.csv` | `attendance_ratio`, `meeting_lead_count` |
| Meeting transcript | `.txt` | `speaking_ratio`                         |
| Chat export        | `.txt` | `chat_participation`                     |

The instructor can upload one session at a time or batch-upload multiple sessions.
Scores update automatically after each upload.

---

## Expected File Formats

### 1. Attendance CSV

```
Meeting_ID, Date, Student_ID, Duration_Minutes, Facilitator
MTG_001, 2026-06-10, Student_1, 45, Yes
MTG_001, 2026-06-10, Student_2, 43, No
MTG_001, 2026-06-10, Student_3, 30, No
```

### 2. Transcript TXT

```
[09:00] Student_1: Let us get started. Today we need to finish the API.
[09:02] Student_2: I pushed the changes last night.
[09:05] Student_3: I am still working on the frontend.
[09:07] Student_1: Okay let us split the remaining tasks.
```

### 3. Chat TXT

```
[09:10] Student_2: Here is the link to the repo https://github.com/...
[09:12] Student_1: Thanks, I will review it now.
[09:15] Student_3: Should we add error handling for the API?
[09:16] Student_2: Yes, I will do that.
```

> **Student ID format:** The names in the transcript and chat must match exactly
> the `Student_ID` values in the attendance CSV. Instructors should replace
> Google Meet display names with the agreed labels (Student_1, Student_2, etc.)
> before uploading, or use the name mapping step described below.

---

## Instructor/group Owner Flow (Step by Step)

```
1. Instructor/group owner opens the group page in CollabTrack
2. Clicks "Upload Meeting Session"
3. Enters a session label (e.g. "Sprint 1 Review — June 10") and how long was the meeting
4. Uploads the three files (attendance CSV, transcript TXT, chat TXT)
6. Clicks "Process Session"
7. CollabTrack parses the files as a background task
8. Instructor sees updated engagement scores on the group dashboard in participation_snapshots like if the presence, how much time spent on the call depending on the total length of the meeting, how much the student spoke or wrote to the chat.
```

---

## Name Mapping (The Tricky Part)

Google Meet transcripts use display names, not Student_ID labels.
CollabTrack handles this in two ways:

**Option — In-app mapping (better UX)**
Instructor uploads raw files. CollabTrack detects unique names
from the transcript and shows a mapping screen:

```
Name found in transcript     →   CollabTrack group member
─────────────────────────────────────────────────────────
John Doe                     →   [ Select member ▼ ]
Alice Mutoni                 →   [ Select member ▼ ]
Bob Karera                   →   [ Select member ▼ ]
```

Instructor maps each name to the correct student once.
CollabTrack remembers the mapping for future uploads for that group.

---

## Pydantic Schemas

```python
class MeetingSessionCreate(BaseModel):
    session_label: str          # e.g. "Sprint 1 Review"
    session_date: date

class NameMappingItem(BaseModel):
    display_name: str           # name found in transcript/chat
    student_id: str             # CollabTrack user ID in the group

class MeetingSessionOut(BaseModel):
    id: str
    group_id: str
    session_label: str
    session_date: date
    status: str                 # PENDING | PROCESSING | COMPLETED | FAILED
    uploaded_at: datetime

class StudentEngagementOut(BaseModel):
    student_id: str
    student_name: str
    attendance_ratio: float     # 0.0 to 1.0
    speaking_ratio: float       # 0.0 to 1.0
    chat_participation: float   # 0.0 to 1.0
    meeting_lead_count: int
    sessions_attended: int
    total_sessions: int

class GroupEngagementReport(BaseModel):
    group_id: str
    total_sessions: int
    last_updated: datetime
    engagement_scores: List[StudentEngagementOut]
```

---

## API Endpoints

```
POST   /groups/{group_id}/meetings
       Create a meeting session record before uploading files

POST   /groups/{group_id}/meetings/{meeting_id}/upload
       Upload the three files (multipart/form-data)
       Fields: attendance_file, transcript_file, chat_file

POST   /groups/{group_id}/meetings/{meeting_id}/mapping
       Submit name-to-student mappings (Option B flow)

GET    /groups/{group_id}/meetings
       List all uploaded sessions for the group

GET    /groups/{group_id}/meetings/{meeting_id}
       Get session details and processing status

DELETE /groups/{group_id}/meetings/{meeting_id}
       Delete a session and recalculate scores without it

GET    /groups/{group_id}/contribution
       Get aggregated engagement scores across all sessions
```

---

## Processing Logic (Background Task)

```python
# Runs after files are uploaded

def process_meeting_session(meeting_id: str, group_id: str):

    # 1. Parse attendance CSV
    #    → who attended, duration, who facilitated

    # 2. Parse transcript TXT
    #    → count speaking turns per name
    #    → total speaking turns in session

    # 3. Parse chat TXT
    #    → count messages per name
    #    → total messages in session

    # 4. Apply name mapping
    #    → replace display names with student IDs

    # 5. Store raw metrics in sync_metrics_log table

    # 6. Recalculate all four engagement metrics
    #    → across all sessions for the group

    # 7. Update engagement scores in database

    # 8. Mark session status as COMPLETED
```

---

## Database Tables Affected

```
meeting_sessions        → one row per uploaded session
meeting_raw_metrics     → parsed metrics per student per session
engagement_scores       → aggregated scores per student per group
                          (recalculated after every new session upload)
```

---

## Validation Rules

- Attendance CSV must have columns: `Student_ID`, `Duration_Minutes`, `Facilitator`
- Transcript TXT lines must follow format: `[HH:MM] Name: message`
- Chat TXT lines must follow same format as transcript
- All three files must belong to the same session (same date and group)
- A session cannot be uploaded twice — system checks for duplicate date + group_id
- Facilitator column accepts: `Yes`, `No`, `True`, `False`, `1`, `0`
