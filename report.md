Note:
The supplied TheBookingSystemVer1.zip was tested for this report, not my own version

Security:
1.  Anyone can be an administrator
    -   Found while using the app and looking through the source code
    -   The option is given to everyone on the registration page
    -   User role should be defaulted to reserver
    -   Only the chosen administrators or the app admin should be able to promote and demote others
2.  Resources can be added without logging in
    -   Found while using the app and looking through the source code
    -   The specifications say only administrators should be able to add resources
    -   Authentication needs to be added to the resource system
3.  Login logging is not GDPR-compliant
    -   Found while looking through the source code
    -   The IP address should be pseudonymized
    -   The address could be hashed, like the password, before storing it
4.  Other reservers' identities are shown
    -   Found while using the app and looking through the source code
    -   None are shown if you aren't logged in, which is as intended
    -   Only your own reservation should be identifiable
    -   getReservationsWithUser() should be edited

Other:
1.  No registration age check
    -   Found while using the app and looking through the source code
    -   It's possible to register as almost 2024 years old or born in the future
    -   Date of birth should be limited from 1900 to the current date for example
2.  Reservation age checking is not accurate
    -   Found while using the app and looking through the source code
    -   The user's age is calculated from the reservation date instead of the current date
    -   An user under 15 years old could place a reservation on a date after their 15th birthday
    -   Postgres has "SELECT CURRENT_DATE;"
3.  Reservations can be placed in the past and in the far future
    -   Found while using the app and looking through the source code
    -   Date checking should be added
4.  Reservations can't be deleted
    -   Found while using the app and looking through the source code
    -   Delete buttons could be added to the reservation table rows
    -   This functionality would be good for the admin and the user who made the reservation

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 1 |
| Low | 0 |
| Informational | 1 |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| Format String Error | Medium | 1 |
| Authentication Request Identified | Informational | 1 |




## Alert Detail



### [ Format String Error ](https://www.zaproxy.org/docs/alerts/30002/)



##### Medium (Medium)

### Description

A Format String error occurs when the submitted data of an input string is evaluated as a command by the application.

* URL: http://localhost:8000/register
  * Method: `POST`
  * Parameter: `password`
  * Attack: `ZAP%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s
`
  * Evidence: ``
  * Other Info: `Potential Format String Error. The script closed the connection on a /%s.`

Instances: 1

### Solution

Rewrite the background program using proper deletion of bad character strings. This will require a recompile of the background executable.

### Reference


* [ https://owasp.org/www-community/attacks/Format_string_attack ](https://owasp.org/www-community/attacks/Format_string_attack)


#### CWE Id: [ 134 ](https://cwe.mitre.org/data/definitions/134.html)


#### WASC Id: 6

#### Source ID: 1

### [ Authentication Request Identified ](https://www.zaproxy.org/docs/alerts/10111/)



##### Informational (High)

### Description

The given request has been identified as an authentication request. The 'Other Info' field contains a set of key=value lines which identify any relevant fields. If the request is in a context which has an Authentication Method set to "Auto-Detect" then this rule will change the authentication to match the request identified.

* URL: http://localhost:8000/login
  * Method: `POST`
  * Parameter: `username`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=username
userValue=foo-bar@example.com
passwordParam=password
referer=http://localhost:8000/login`

Instances: 1

### Solution

This is an informational alert rather than a vulnerability and so there is nothing to fix.

### Reference


* [ https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/ ](https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/)



#### Source ID: 3