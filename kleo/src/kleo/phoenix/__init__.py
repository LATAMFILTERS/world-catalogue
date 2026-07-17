"""PROJECT-PHOENIX evidence-handling module.

Hard rule enforced throughout this package: original evidence is never
modified or deleted. KLEO only ever reads an original to hash and copy it;
all further work happens on the working copy.
"""
