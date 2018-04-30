"""Setup for cetloxblock XBlock."""

import os

from setuptools import setup


def package_data(pkg, roots):
    """Generic function to find package_data.

    All of the files under each of the `roots` will be declared as package
    data for package `pkg`.

    """
    data = []
    for root in roots:
        for dirname, _, files in os.walk(os.path.join(pkg, root)):
            for fname in files:
                data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}

base_path = os.path.dirname(__file__)
README = open(os.path.join(base_path, "README.md")).read()

setup(
    name='cetloxblock-xblock',
    version='1.0.10',
    description='An XBlock that embeds the CET Player platform into Open edX. The CET player contains the ability to create personalized learning path for each student.',
    long_description=README,
    author="cetil",
    url="https://github.com/ILCET/lo-activity-xblock",
    license='UNKNOWN',          # TODO: choose a license: 'AGPL v3' and 'Apache 2.0' are popular.
    packages=[
        'cetloxblock',
    ],
    install_requires=[
        'XBlock',
    ],
    entry_points={
        'xblock.v1': [
            'cetloxblock = cetloxblock:CetLoXBlock',
        ]
    },
    package_data=package_data("cetloxblock", ["static", "public"]),
)
