var alipi = {
    auth : " ",
    loc:" ",
    elementTagName: " ",
    elementId: " ",
    flag : 0,
    showlinks : 0,
    showbox : 0,
    blog_flag : false,
    testContext : function()
    {

	$(document).ready(function(){$('body *').contents().filter(function() 
{
    try{
	if(this.nodeType == 3)
	    {
		return (this.nodeType == 3) && this.nodeValue.match(/\S/);}}
    catch(err)
	{
	}}).wrap('<span m4pageedittype=text/>')}); 


	vimg = document.getElementsByTagName('img');
	for(i=0; i<vimg.length; i++)
	    {
		vimg[i].setAttribute('m4pageedittype','image');
	    }

    },

    createMenu: function(menu_list) {
	var xyz = document.getElementById("show-box");
	xyz.innerHTML = "";
	for(var i=0;i<menu_list.length;i++)
	    {
		var para = document.createElement("p");
		var newel = document.createElement("a");
		newel.textContent = menu_list[i];
		newel.setAttribute("href", "http://y.a11y.in/web?foruri="+encodeURIComponent(window.location.href)+"&lang="+menu_list[i]+"&interactive=1");
		para.appendChild(newel);
		xyz.appendChild(para);
	    }
    },
    ajax1: function() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
	    if(xhr.readyState == 4)
		{
		    if(xhr.responseText == "empty")
			{ }
		    else
			{
			    document.getElementById("see-narration").disabled = false;
			    document.getElementById("blog-filter").disabled = false;
			    document.getElementById("go").disabled = false;
			    alipi.showbox = JSON.parse(xhr.responseText);
			}
		}
	}
	xhr.open("POST","http://y.a11y.in/menu",true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send('url='+encodeURIComponent(window.location.href)) ;
    },
    createDomainMenu: function() {
	var xyz = document.getElementById("show-links");
	xyz.innerHTML = "";
	menu_list = alipi.showlinks;
	for(var i=0; i<menu_list.length;i++)
	    {
		var para = document.createElement("p");
		var newel = document.createElement("a");
		newel.textContent = menu_list[i];
		newel.setAttribute("href", menu_list[i]);
		para.appendChild(newel);
		xyz.appendChild(para);
	    }
	$('a').hover(
		     function() {
			 var xhr = new XMLHttpRequest();
			 xhr.onreadystatechange = function()
			 {
			     if(xhr.readyState == 4)
				 {
				     if(xhr.responseText == "empty")
					 { }
				     else
					 {
					     menu_list = JSON.parse(xhr.responseText);
					     x = '';
					     for(i=0; i<menu_list.length; i++) {
						 if (i == menu_list.length-1) {
						     x += menu_list[i];
						 } else {
						     x += menu_list[i] + ", ";
						 }
					     }
					     document.getElementById('show-links').title = x;
					 }
				 }
			 }
			 xhr.open("POST","http://y.a11y.in/menu",true);
			 xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			 xhr.send('url='+encodeURIComponent($(this).attr('href'))) ;
		     },
		     function () {$('#show-links').find("span").remove();}
		     );
    },

    ajaxLinks1: function() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
	    if(xhr.readyState == 4)
		{
		    if(xhr.responseText == "empty")
			{ }
		    else
			{
			    document.getElementById("see-links").disabled = false;
			    alipi.showlinks = JSON.parse(xhr.responseText);
			}
		}
	}
	xhr.open("POST","http://y.a11y.in/domain",true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send('url='+encodeURIComponent(window.location.hostname));
    },

    editPage: function() {
	alipi.testContext(); page_edit_client('4seiz', '4l85060vb9', '336e2nootv6nxjsvyjov', 'VISUAL', 'false', '');
	document.getElementById("renarrated_overlay").style.display = "none";
    },

    showBox: function() {
	$(function() {
		$( "#show-box" ).dialog( "destroy" );
		
		$( "#show-box" ).dialog({
			width: 300,
			    height: 300,
			    modal: true
			    });
	    });
	alipi.createMenu(alipi.showbox);
    },

    showBox1: function() {
	$(function() {
		$( "#show-links" ).dialog( "destroy" );
		
		$( "#show-links" ).dialog({
			width: 500,
			    height: 300,
			    modal: true
			    });
	    });
	alipi.createDomainMenu();
    },

    blogFilter: function() {
	if (alipi.blog_flag == false) {
	alipi.blog_flag = true;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
	    if(xhr.readyState == 4)
		{
		    if(xhr.responseText == "empty")
			{ }
		    else
			{
			    var sel = document.getElementById("blog-filter");
			    var menu_list = JSON.parse(xhr.responseText);
			    blogArray = [];
			    for (var i=0; i< menu_list.length; i++)
				{
				    blogArray[i] = menu_list[i].split("http://")[1].split(".com")[0] + ".com";
				}
			    blogArray.sort();
			    for (var i=0; i < blogArray.length; i++)
				{
				    if ( i == 0 )
					{
					    opt = document.createElement("option");
					    opt.textContent = blogArray[0];
					    sel.appendChild(opt);
					}
				    else if(blogArray[i] == blogArray[i-1])
					{ }
				    else 
					{
					    opt = document.createElement("option");
					    opt.textContent = blogArray[i];
					    sel.appendChild(opt);
					}
				}
			}
		}
	}
	xhr.open("POST","http://y.a11y.in/blog",true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.send('url='+encodeURIComponent(window.location.href));
	}
    },
    go: function() {
	if (document.getElementById("blog-filter").value == "Choose a blog name")
	    {    }
	else {
	    window.open("http://y.a11y.in/web?foruri=" + encodeURIComponent(window.location.href) + "&blog=" + document.getElementById("blog-filter").value);
	}
    },

    loadOverlay: function() {
	
	body = document.body;
	if(window.$ === undefined)
	{
	jq = document.createElement("script");
	jq.setAttribute("type", "text/javascript");
	jq.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.js");
	body.appendChild(jq);
	}
	overlay = document.createElement("div");
	overlay.setAttribute("id", "renarrated_overlay");
	overlay.setAttribute("class", "ui-widget-header ui-corner-all");
	overlay.setAttribute("style", "position:fixed;top:0;width:80%;align:center;text-align:center;left:10%");
	body.appendChild(overlay);
	
	jq_ui = document.createElement("script");
	jq_ui.setAttribute("type", "text/javascript");
	jq_ui.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.js");
	body.appendChild(jq_ui);
	
	
	
	jqlink = document.createElement("link");
	jqlink.setAttribute("rel", "stylesheet");
	jqlink.setAttribute("type", "text/css");
	jqlink.setAttribute("href", "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/ui-lightness/jquery-ui.css");
	body.appendChild(jqlink);

	show_box = document.createElement("div");
	show_box.setAttribute("id", "show-box");
	show_box.title = "Please choose one of the languages";
	body.appendChild(show_box);

	show_links = document.createElement("div");
	show_links.setAttribute("id", "show-links");
	show_links.title = "Please choose one of the links";
	body.appendChild(show_links);

	edit_current = document.createElement("input");
        edit_current.setAttribute("id", "edit-current");
	edit_current.setAttribute("type", "submit");
	edit_current.setAttribute("onclick", "alipi.editPage();");
	edit_current.setAttribute("value", "Re-narrate this page");
	overlay.appendChild(edit_current);

	see_narration = document.createElement("input");
	see_narration.setAttribute("id", "see-narration");
	see_narration.setAttribute("type", "submit");
	see_narration.setAttribute("onclick", "alipi.showBox();");
	see_narration.setAttribute("value", "See narrations");
	see_narration.disabled = true;
	overlay.appendChild(see_narration);
	alipi.ajax1();

	see_links = document.createElement("input");
	see_links.setAttribute("id", "see-links");
	see_links.setAttribute("type", "submit");
	see_links.setAttribute("onclick", "alipi.showBox1();");
	see_links.setAttribute("value", "List of pages narrated");
	see_links.disabled = true;
	overlay.appendChild(see_links);
	alipi.ajaxLinks1();

	blog_filter = document.createElement("select");
	blog_filter.setAttribute("id", "blog-filter");
	blog_filter.setAttribute("style", "min-width:200px;max-width:200px;");
	blog_filter.setAttribute("onclick", "alipi.blogFilter();");
	blog_option = document.createElement("option");
	blog_option.textContent = "Choose a blog name";
	blog_filter.appendChild(blog_option);
	blog_filter.disabled = true;
	overlay.appendChild(blog_filter);

	go = document.createElement("input");
	go.setAttribute("id", "go");
	go.setAttribute("type", "submit");
	go.setAttribute("onclick", "alipi.go();");
	go.setAttribute("value", "Go");
	go.disabled = true;
	overlay.appendChild(go);
},

};

if (window.location.hostname != "y.a11y.in") {
    document.addEventListener('DOMContentLoaded',function(){
	document.body.addEventListener('load',alipi.loadOverlay(),true);},false);
}