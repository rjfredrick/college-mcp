/** Canonical admissions data schema — normalized from CDS extraction. */

export interface ResponseMetadata {
  last_updated: string;
  source: string;
  academic_year: string;
}

export interface SchoolIdentity {
  id: string;
  name: string;
  slug: string;
  website: string;
  control: "public" | "private_nonprofit" | "proprietary";
  city: string;
  state: string;
}

export interface AdmissionStats extends ResponseMetadata {
  acceptance_rate?: number | null;
  applicants?: number | null;
  admitted?: number | null;
  enrolled?: number | null;
  yield?: number | null;
}

export interface ScoreRange {
  min?: number | null;
  max?: number | null;
}

export interface TestScores extends ResponseMetadata {
  sat_reading_writing?: ScoreRange | null;
  sat_math?: ScoreRange | null;
  sat_composite?: ScoreRange | null;
  act_composite?: ScoreRange | null;
  test_optional?: boolean | null;
  percent_submitting_sat?: number | null;
  percent_submitting_act?: number | null;
}

export interface GpaProfile extends ResponseMetadata {
  average_gpa?: number | null;
  percent_in_top_tenth?: number | null;
  percent_in_top_quarter?: number | null;
  percent_in_top_half?: number | null;
}

export interface AdmissionPlan {
  type: "early_decision" | "early_action" | "regular" | "rolling" | "other";
  label?: string;
  binding?: boolean | null;
  rolling?: boolean | null;
  application_deadline?: string | null;
  priority_application_deadline?: string | null;
  notification_date?: string | null;
  enrollment_deposit_deadline?: string | null;
}

export interface Deadlines extends ResponseMetadata {
  plans: AdmissionPlan[];
}

export interface ReplyPolicy {
  type: "may_1" | "may_1_or_weeks_after" | "no_set_date" | "other";
  description?: string | null;
  weeks_after_notification?: number | null;
}

export interface HousingDeposit {
  amount?: number | null;
  deadline?: string | null;
  refundable?: boolean | null;
}

export interface ApplicationPolicies extends ResponseMetadata {
  admissions_url?: string | null;
  has_application_fee?: boolean | null;
  application_fee?: number | null;
  fee_waiver_available?: boolean | null;
  online_same_fee?: boolean | null;
  reply_policy?: ReplyPolicy | null;
  housing_deposit?: HousingDeposit | null;
  deferred_admission_allowed?: boolean | null;
  max_deferral_period?: string | null;
  offers_early_decision?: boolean | null;
  offers_early_action?: boolean | null;
  restrictive_early_action?: boolean | null;
  notification_rolling?: boolean | null;
  has_application_closing_date?: boolean | null;
  test_policy_summary?: string | null;
  policy_notes?: string[];
}

export interface Tuition {
  type: "flat" | "residency_based";
  flat?: number | null;
  in_state?: number | null;
  out_of_state?: number | null;
}

export interface CostOfAttendance extends ResponseMetadata {
  tuition: Tuition;
  required_fees?: number | null;
  room_and_board?: number | null;
  books_and_supplies?: number | null;
  other_expenses?: number | null;
  total_cost_of_attendance?: number | null;
}

export interface FinancialAidProfile extends ResponseMetadata {
  percent_receiving_aid?: number | null;
  percent_need_fully_met?: number | null;
  average_need_based_package?: number | null;
  average_debt_at_graduation?: number | null;
}

export interface EnrollmentProfile extends ResponseMetadata {
  total_enrollment?: number | null;
  undergraduate_enrollment?: number | null;
  graduate_enrollment?: number | null;
  student_faculty_ratio?: string | null;
  percent_out_of_state?: number | null;
}

export interface AcademicProgram {
  name: string;
  level?: "certificate" | "associate" | "bachelor" | "master" | "doctorate" | "other";
}

export interface AcademicPrograms extends ResponseMetadata {
  degrees_offered: string[];
  programs?: AcademicProgram[];
}

export interface SchoolData {
  school: SchoolIdentity;
  admission_stats: AdmissionStats | null;
  test_scores: TestScores | null;
  gpa_profile: GpaProfile | null;
  deadlines: Deadlines | null;
  application_policies: ApplicationPolicies | null;
  cost_of_attendance: CostOfAttendance | null;
  financial_aid_profile: FinancialAidProfile | null;
  enrollment_profile: EnrollmentProfile | null;
  academic_programs: AcademicPrograms | null;
}

export type ToolSection = Exclude<keyof SchoolData, "school">;
