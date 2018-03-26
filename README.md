# lo-activity-xblock
## Goal
The xblock will embed CET Player platform into EdX. The CET player contains the ability to
create personlized learning path for each student.
## Method
Activities in CET online courses have the ability of adaptive learning. Embedding them in edx
course will enhance the edx LMS by the adaptive flow. The xblock will be embedded in the
course as an "advanced" unit.
## XBlock Structure and Description
The xblock within a course will refer to a CET content folder as a resource of activities
(learning objects). A service in CET will map the edx course to its folder in CET.
### Studio View
In edit mode, the xblock will get from CET servers the list of CET activities relevant for the
EdX course. The instructor will be able to select one of them to run in the unit being
designed. Author view will show the activity in preview (stateless) mode.
### Student View
The student will meet the adaptive learning object. Unit level grades will be reported to EdX
(not implemented yet).
In order to operate in adaptive mode, when the first student enters the activity, a task will be
created using CET services. Then this task will be used for all the students of the same
course in the activity.
We need the task to separate between courses and student’s class - so we can manage the
student activities in the right context.
### Learning Object Embeding
Preferred: inline (it doesn’t work yet, we need consultant here). It seems that there are still
challenges with the deployment in EdX, for now it is an iframe that can communicate with its
host.
## User Authentication
CET activities require CET identity to run properly. The link with edx identity (SSO) will be
done through EDU IDM: the first time the user enters an activity, it will refer to IDM login to
get its IDM identity and then retrieve its equivalent in CET.
