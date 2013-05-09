devmirror
=========

If you want to use this tool, please go to
[ciju.in/devmirror](http://ciju.in/devmirror). This document is for
developers interested in devmirror.

devmirror is a way to see and inspect (with chrome devtools) a remote
users session. 

Basically, tunneled devtools + dom change mirroring, of users session.

## How to use it ##

    |-----------------------------------------------------+---------------------------------|
    | You (the developer)                                 | User                            |
    |-----------------------------------------------------+---------------------------------|
    | Ask the User to download devmirror binary.          |                                 |
    |-----------------------------------------------------+---------------------------------|
    |                                                     | User download binary.           |
    |-----------------------------------------------------+---------------------------------|
    | Ask the User to execute                             |                                 |
    | ./devmirror -sub "<subdomain>"                      |                                 |
    | Where <subdomain> is the subdomain you have chosen  |                                 |
    |-----------------------------------------------------+---------------------------------|
    |                                                     | User runs the command           |
    |                                                     | A browser opens for the user,   |
    |                                                     | on which he/she opens your site |
    |-----------------------------------------------------+---------------------------------|
    | You open <subdomain>.localtunnel.net:8080           |                                 |
    | And see what User is doing, and debug with devtools |                                 |
    |-----------------------------------------------------+---------------------------------|
