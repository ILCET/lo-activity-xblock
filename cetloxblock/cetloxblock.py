# -*- coding: utf-8 -*-
""" 
This XBlock displays a CET LO item.
The studio view enables the author to select the LO for the current xblock instance.
"""

import pkg_resources
from xblock.core import XBlock
from xblock.fields import String, Scope
from xblock.fragment import Fragment

class CetLoXBlock(XBlock):
    """ 
    This XBlock displays a CET LO item.
    The studio view enables the author to select the LO for the current xblock instance.
    """

    PROTOCOL = "https:"
    ITEM_URL_TEMPLATE = u"{protocol}//lo{cetdomain}/player/?document={documentid}&language={language}&sitekey=ebag#options=nobar"
    TASK_URL_TEMPLATE = u"{protocol}//lo{cetdomain}/player/xblockplayer.html?task={taskid}&sitekey=ebag"

    #############################################################################
    # ALL STRINGS ARE UNICODE!
    # ALL FUNCTION DEFS GET UNICODE PARAMETERS AND RETURN UNICODE VALUES!
    # KEEP THIS SO FOR YOUR HEALTH AND WELL BEING.
    #############################################################################

    display_name = String(display_name="Display Name",
        help="This name appears in the horizontal navigation at the top of the page.",
        scope=Scope.settings,
        default=u"CET LO Activity")

    documentid = String(default="", scope=Scope.content, help="The LO id")
    language = String(default="he", scope=Scope.content, help="The LO language code")
    folderid = String(default="", scope=Scope.content, help="The LO folder (scope) id for adaptive LOs")
    taskid = String(default="", scope=Scope.user_state, help="The LO id")

    has_author_view = True
    
    def resource_string(self, path):
        """ helper for getting UNICODE STRINGS from static resources (from readthedocs/xblock tutorial)."""
        data = pkg_resources.resource_string(__name__, path)
        data = data.decode("utf8")
        return data

    def author_view(self, context=None):
        if not self.documentid:
            return Fragment(u"<h1>Please edit to select an activity for this component</h1>")

        return self.student_view(context)

    def student_view(self, context=None):
        """
        The primary view of the CetLoXBlock, shown to students when viewing courses.
        """
        if not self.documentid:
            return Fragment(u"EMPTY student_view")

        iframe_src = u"about:blank"
        
        itemTemplate = self.ITEM_URL_TEMPLATE.format(protocol=self.PROTOCOL, cetdomain=u"{cetdomain}", language=self.language, documentid=u"{itemid}")
        taskTemplate = self.TASK_URL_TEMPLATE.format(protocol=self.PROTOCOL, cetdomain=u"{cetdomain}", taskid=u"{taskid}")
        html = self.resource_string("static/html/cetlo_student_view.html")
        html = html.format(documentid=self.documentid, language=self.language, folderid=self.folderid, taskid=self.taskid, itemTemplate=itemTemplate, taskTemplate=taskTemplate, iframeSrc=iframe_src)

        frag = Fragment(html)
        frag.add_css(self.resource_string("static/css/cetloxblock_student.css"))
        frag.add_javascript(self.resource_string("static/js/env-manager.js"))
        frag.add_javascript(self.resource_string("static/js/sso.js"))
        frag.add_javascript(self.resource_string("static/js/student-xblock.js"))
        frag.add_javascript(self.resource_string("static/js/services.js"))
        frag.initialize_js('CetLoXBlock')
        return frag

    def studio_view(self, context=None):
        """
        The studio view of the CetLoXBlock, letting author to select a LO.
        This is a stub showing a fix list of LO items.
        """
        html = self.resource_string("static/html/cetlo_studio_view.html")

        selectedLO = dict(id=self.documentid, language=self.language, folderid=self.folderid, title=self.display_name)
        html = html.format(selected=selectedLO)
        html += self.resource_string("static/html/cetlo_studio_item_template.html")

        frag = Fragment(html)
        frag.add_css(self.resource_string("static/css/cetloxblock_studio.css"))
        frag.add_javascript(self.resource_string("static/js/studio-xblock.js"))
        frag.add_javascript(self.resource_string("static/js/services.js"))
        frag.initialize_js('CetLoXBlock')
        return frag

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        """
        Called when submitting the form in Studio. Save the selected document
        """
        self.documentid = data["documentid"].decode('utf8')
        self.language = data["language"].decode('utf8')
        self.folderid = data["folderid"].decode('utf8')
        self.display_name = data["title"]
        return {'result': 'success'}

    @XBlock.json_handler
    def save_taskid(self, data, suffix=''):
        """
        Save id of the newly created task for student
        """
        self.taskid = data["taskid"].decode('utf8')
        return {'result': 'success'}

    @XBlock.json_handler
    def publish_grade(self, data, suffix=''):
        """
        Send grade to edx LMS
        """
        self.runtime.publish(self, "grade",
                            { 
                                "value": data["grade"],
                                "max_value": data["weight"] 
                            })
        return {'result': 'success'}


    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [("CetLoXBlock",
                """<cetloxblock/>
                """),
            ("Multiple CetLoXBlock",
                """<vertical_demo>
                <cetloxblock/>
                <cetloxblock/>
                </vertical_demo>
                """),]
