/* ===================================================================
 * Elevate - Main JS
 *
 * ------------------------------------------------------------------- */ 

(function($) {

	"use strict";

	/* ------------------------------------------------------
	 * Preloader and Intro Animations
	 * ------------------------------------------------------ */ 	 
   $(window).on('load', function() {

      // will first fade out the loading animation 
    	$("#loader").fadeOut("slow", function(){

        // will fade out the whole DIV that covers the website.
        $("#preloader").delay(300).fadeOut("slow");

      }); 

      // intro section animation
     	if (!$("html").hasClass('no-cssanimations')) {

     		setTimeout(function(){

    			$('body .animate-intro').each(function(ctr) {

					var el = $(this),
                  animationEfx = el.data('animate');

               if (animationEfx === null || animationEfx === undefined || animationEfx.trim() === "") {
                 	animationEfx = "fadeInUp";
               }

              	setTimeout( function () {
						el.addClass(animationEfx + ' animated');
					}, ctr * 100);

				});
					
			}, 1000);
     	}   	   	

  	});


	/* ------------------------------------------------------
	 * Hide Logo
	 * ------------------------------------------------------ */ 	 
   $(window).on('scroll', function() {

		var y = $(window).scrollTop(),
		    siteHeader = $('header'),
		    siteLogo = siteHeader.find('.logo'),
		    triggerHeight = siteHeader.innerHeight();		
     
	   if (y > triggerHeight) {
	      siteLogo.fadeOut();	     
	   }
      else {
         siteLogo.fadeIn();
      }
    
	});


	/* ------------------------------------------------------
	 * Fitvids
	 * ------------------------------------------------------ */ 	
  	$(".fluid-video-wrapper").fitVids();


	/* ------------------------------------------------------
	 * Flexslider
	 * ------------------------------------------------------ */
  	$(window).on('load', function() {

	   $('#testimonial-slider').flexslider({
	   	namespace: "flex-",
	      controlsContainer: ".flexslider-controls",
	      animation: "fade",
		  	manualControls: ".flex-control-nav li",	     
	      controlNav: true,
	      directionNav: false,
	      smoothHeight: true,
	      slideshowSpeed: 7000,
	      animationSpeed: 600,
	      randomize: false,
	      touch: true,
	      useCSS: false, // Chrome fix
	      start: function(slider){
			   $(slider).trigger('resize');  	
			}			
	   });

   });


	/* ------------------------------------------------------
	 * Mobile Menu
	 * ------------------------------------------------------ */
   var toggleButton = $('.menu-toggle'),
       nav = $('#menu-nav-wrap'),
       siteBody = $('body'),
       mainContents = $('#main-content-wrap, header');

	// open-close menu by clicking on the menu icon
	toggleButton.on('click', function(e){

		e.preventDefault();

		toggleButton.toggleClass('is-clicked');
		siteBody.toggleClass('menu-is-open').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
			// firefox transitions break when parent overflow is changed, 
			// so we need to wait for the end of the trasition to give the body an overflow hidden
			siteBody.toggleClass('overflow-hidden');
		});
			
		// check if transitions are not supported 
		if ($('html').hasClass('no-csstransitions')) {
			 siteBody.toggleClass('overflow-hidden');
		}

	});

	// close menu clicking outside the menu itself
	mainContents.on('click', function(e){

		if( !$(e.target).is('.menu-toggle, .menu-toggle span') ) {

			toggleButton.removeClass('is-clicked');
			siteBody.removeClass('menu-is-open').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
				siteBody.removeClass('overflow-hidden');
			});
			
			// check if transitions are not supported
			if ($('html').hasClass('no-csstransitions')) {
				 siteBody.removeClass('overflow-hidden');
			}
		}

	});


	/* ------------------------------------------------------
	 * Stat Counter
	 * ------------------------------------------------------ */
   var statSection = $("#stats"),
       stats = $(".stat-count");

   statSection.waypoint({

   	handler: function(direction) {

      	if (direction === "down") {       		

			   stats.each(function () {
				   var $this = $(this);

				   $({ Counter: 0 }).animate({ Counter: $this.text() }, {
				   	duration: 4000,
				   	easing: 'swing',
				   	step: function (curValue) {
				      	$this.text(Math.ceil(curValue));
				    	}
				  	});
				});

       	} 

       	// trigger once only
       	this.destroy();  

		},			
		offset: "90%"
	
	});


  /* ------------------------------------------------------
	* Highlight the current section in the navigation bar
	* ------------------------------------------------------ */
	var sections = $("section"),
	navigationLinks = $("#menu-nav-wrap .nav-list a");	

	sections.waypoint( {

      handler: function(direction) {

		   var activeSection;

			activeSection = $('section#' + $(this.element).attr("id"));

			if (direction === "up") activeSection = activeSection.prev();

			var activeLink = $('#menu-nav-wrap .nav-list a[href="#' + activeSection.attr("id") + '"]');			

         navigationLinks.parent().removeClass("current");
			activeLink.parent().addClass("current");

		},
		offset: '25%'
	});


  /* ------------------------------------------------------
	* Smooth Scrolling
	* ------------------------------------------------------ */
  	$('.smoothscroll').on('click', function (e) {
	 	
	 	e.preventDefault();

   	var target = this.hash,
    	$target = $(target);

    	$('html, body').stop().animate({
       	'scrollTop': $target.offset().top
      }, 800, 'swing').promise().done(function () {

      	// check if menu is open
      	if ($('body').hasClass('menu-is-open')) {
				$('.menu-toggle').trigger('click');
			}

      	window.location.hash = target;
      });

  	});


  /* ------------------------------------------------------
	* Placeholder Plugin Settings
	* ------------------------------------------------------ */
	$('input, textarea, select').placeholder()  


  /* ------------------------------------------------------
	* AjaxChimp
	* ------------------------------------------------------ */

	// Example MailChimp url: http://xxx.xxx.list-manage.com/subscribe/post?u=xxx&id=xxx
	var mailChimpURL = 'http://facebook.us8.list-manage.com/subscribe/post?u=cdb7b577e41181934ed6a6a44&amp;id=e65110b38d'

	$('#mc-form').ajaxChimp({

		language: 'es',
	   url: mailChimpURL

	});

	// Mailchimp translation
	//
	//  Defaults:
	//	 'submit': 'Submitting...',
	//  0: 'We have sent you a confirmation email',
	//  1: 'Please enter a value',
	//  2: 'An email address must contain a single @',
	//  3: 'The domain portion of the email address is invalid (the portion after the @: )',
	//  4: 'The username portion of the email address is invalid (the portion before the @: )',
	//  5: 'This email address looks fake or invalid. Please enter a real email address'

	$.ajaxChimp.translations.es = {
	  'submit': 'Submitting...',
	  0: '<i class="fa fa-check"></i> We have sent you a confirmation email',
	  1: '<i class="fa fa-warning"></i> You must enter a valid e-mail address.',
	  2: '<i class="fa fa-warning"></i> E-mail address is not valid.',
	  3: '<i class="fa fa-warning"></i> E-mail address is not valid.',
	  4: '<i class="fa fa-warning"></i> E-mail address is not valid.',
	  5: '<i class="fa fa-warning"></i> E-mail address is not valid.'
	} 


	/* ------------------------------------------------------
	* Animations
	* ------------------------------------------------------ */
	if (!$("html").hasClass('no-cssanimations')) {

		$('.animate-this').waypoint({

			handler: function(direction) {

				var defAnimationEfx = "fadeInUp";

				if ( direction === 'down' && !$(this.element).hasClass('animated')) {

					$(this.element).addClass('item-animate');

					setTimeout(function() {

						$('body .animate-this.item-animate').each(function(ctr) {

							var el = $(this),
		                  animationEfx = el.data('animate');

		               if (animationEfx === null || animationEfx === undefined || animationEfx.trim() === "") {
		                 	animationEfx = defAnimationEfx;
		               }

		              	setTimeout( function () {
								el.addClass(animationEfx + ' animated');
								el.removeClass('item-animate');
							}, ctr * 50);

						});
							
					}, 500);

				}

				// trigger once only
       		this.destroy();  

			}, 
			offset: '95%'

		}); 
	} 

  /* ------------------------------------------------------
	* Back to Top
	* ------------------------------------------------------ */
	var pxShow = 300,      // height on which the button will show
	    fadeInTime = 400,  // how slow/fast you want the button to show
	    fadeOutTime = 400, // how slow/fast you want the button to hide
       scrollSpeed = 300, // how slow/fast you want the button to scroll to top. can be a value, 'slow', 'normal' or 'fast'
       goTopButton = $("#go-top") 

	// Show or hide the sticky footer button
	$(window).on('scroll', function() {

		if ($(window).scrollTop() >= pxShow) {
			goTopButton.fadeIn(fadeInTime);
		} else {
			goTopButton.fadeOut(fadeOutTime);
		}

	});
 

})(jQuery);

/**
 * Created by sungmin on 9/20/16.
 */

var allData = [];


// Variable for the visualization instance
var racialComparison;
var codeBook;

var suicideChart;

var counter_female = 1;
var counter_male = 1;


// Load data asynchronously
queue()
	.defer(d3.csv,"data/DataJS.csv")
	.defer(d3.json,"data/code.json")
	.await(createVis);


function createVis(error, mainData, metaData) {
	if (error) { console.log(error); }

	// Remove participants of mixed race backgrounds
	allData = mainData.filter(function (person) { return (person.NEWRACE2 !== "6"); });

	// Clean data
	allData.forEach(function(person) {
		// Recode in NEWRACE2 Hispanic as 4 and Pacific Islander as 6
		switch (person.NEWRACE2) {
			case "7":
				person.NEWRACE2 = "4";
				break;
			case "4":
				person.NEWRACE2 = "6";
		}

		// Convert numeric values to 'numbers'
		for (var variable in person) { person[variable] = +person[variable];}

		// Add new racial category (combine AA and PI),
		if (person.NEWRACE2 < 6) {
			person.RACEGRP = person.NEWRACE2;
		} else {
			person.RACEGRP = 5;
		}
		//Debug - console.log("newrace2: " + person.NEWRACE2 + " racegrp: " + person.RACEGRP);

		// Create new age category
		if (person.AGE2 <= 6) {
			person.AGECAT = 1;
		} else if ((person.AGE2 >= 7) && (person.AGE2 <= 11)) {
			person.AGECAT = 2;
		} else if ((person.AGE2 == 12) || (person.AGE2 == 13)) {
			person.AGECAT = 3;
		} else if (person.AGE2 >= 14) {
			person.AGECAT = person.AGE2 - 10;
		}

	});
	// Debug - console.log(allData);


	// Assign code data to codeBook
	codeBook = metaData;

	//Add image name to data
	allData.forEach(function(person){
		if(person.IRSEX == 2 && person.RACEGRP == 5 && (person.MHSUITHK == 1 || person.MHSUIPLN == 1 || person.MHSUITRY ==1))
			{
				//console.log(person);
				person.IMG = "images/female" + counter_female + "_student.jpg";
				//console.log(person.IMG);
				counter_female++;
			}
		else if (person.IRSEX == 1 && person.RACEGRP == 5 && (person.MHSUITHK == 1 || person.MHSUIPLN == 1 || person.MHSUITRY ==1)){
			//console.log(person);
			person.IMG = "images/male" + counter_male + "_student.jpg";
			//console.log(person.IMG);
			counter_male++;
		}
	})


	// Instantiate Visualization
	racialComparison = new RacialComparison("racialComparison", allData, metaData);
	suicideChart= new SuicideChart("suicide-chart",allData,metaData);

}



/*
 * Filters - Age slider and Income slider
 * Borrowed and modified from https://www.youtube.com/watch?v=reNLCuaxFF8
 */
$("#ageSlider").slider({
	range: true,
	min: 18,
	max: 73,
	values: [18, 73],
	step: 5,
	slide: function (event, ui) {
		$("#rangeAgeSlider").html(ui.values[0] + " - " + ui.values[1] + " Years");
	},
	stop: function (event, ui) {
		$("#rangeAgeSlider").on("sliderchange", selectionChanged());
	}
});

$("#rangeAgeSlider")
	.html($("#ageSlider").slider("values", 0) + " - " + $( "#ageSlider").slider("values", 1) + " Years");

$("#incomeSlider").slider({
	range: true,
	min: 0,
	max: 80000,
	values: [0, 80000],
	step: 10000,
	slide: function (event, ui) {
		$("#rangeIncomeSlider").html(function () {
			if (ui.values[1] == 80000) {
				return ("$" + ui.values[0].toLocaleString() + " - $" + (ui.values[1] - 1).toLocaleString() + "+");
			} else {
				return ("$" + ui.values[0].toLocaleString() + " - $" + (ui.values[1] - 1).toLocaleString());
			}
		});
	},
	stop: function (event, ui) {
		$("#rangeIncomeSlider").on("sliderchange", selectionChanged());
	}
});

$("#rangeIncomeSlider").html(function () {
	if ($( "#incomeSlider").slider("values", 1) == 80000) {
		return ("$" + $("#incomeSlider").slider("values", 0).toLocaleString() + " - $" + ($( "#incomeSlider").slider("values", 1) - 1).toLocaleString() + "+");
	} else {
		return ("$" + $("#incomeSlider").slider("values", 0).toLocaleString() + " - $" + ($( "#incomeSlider").slider("values", 1) - 1).toLocaleString());
	}
});

/*
 * Get values from checkboxes
 * Borrowed and modified from http://www.dyn-web.com/tutorials/forms/checkbox/group.php
 */
function selectionChanged () {

	/*
	// get reference to checkboxes
	var filters = $("#filtersRacialComparison input");
	//console.log(filters);

	// object of arrays storing the checked Check Box values
	var checked = {};

	// Check if a check box is checked. If checked, then add values to the object called checked
	for (var i = 0 ; i < filters.length; i++) {
		if (( filters[i].type === 'checkbox' ) && (filters[i].checked)){
			// if a filter already exists as property in checked, then add to it. Else, create new property and add the value.
			if (checked.hasOwnProperty(filters[i].className)) {
				checked[filters[i].className].push(+filters[i].value);
			} else {
				checked[filters[i].className] = [+filters[i].value];
			}
		}
	}
	*/

	// Object of arrays to store filter selections
	var selected = {};
	//console.log("trigger");

	// Add selections from select list - mental health, education completed
	var mentalHealthToggleSelection = +$("input[name='mentalHealthButtonOption']:checked").val();
	if (mentalHealthToggleSelection == 1) {
		selected.mhFilter = [1];
	} else {
		var mhSelectedArray = [];
		$('#mentalHealthFilter option:selected').each(function(i, selected){
			mhSelectedArray[i] = $(selected).val();
		});
		selected.mhFilter = mhSelectedArray;
	}

	var edComp = +$("#educationFilter").val();
	if (edComp !== 0) {
		selected.educationFilter = [edComp];
	}

	// Add selections from buttons - gender
	var gender = +$("input[name='genderFilterOption']:checked").val();
	if (gender !== 0) {
		selected.genderFilter = [gender];
	}

	// Add selection from slider filters - age, income
	var ageOrIncome = {
		"age": ["#ageSlider", "#rangeAgeSlider", 7, "AGECAT", 0],
		"income": ["#incomeSlider", "#rangeIncomeSlider", 8, "IRFAMIN3", 1]
	};

	function sliderSelections (filter) {
		var selectedCodes = [];
		var sliderLocation = $(ageOrIncome[filter][0]);
		var min = sliderLocation.slider("values", 0);
		var max = sliderLocation.slider("values", 1) - ageOrIncome[filter][4];
		var minCode = 1;
		var maxCode = ageOrIncome[filter][2];
		var codeBookName = ageOrIncome[filter][3];
		var objInCodeBook = codeBook[codeBookName].code;

		for (var range in objInCodeBook) {
			if ((objInCodeBook[range][0] <= min) && (objInCodeBook[range][1] >= min)) {
				minCode = range;
			}
			if ((objInCodeBook[range][0] <= max) && (objInCodeBook[range][1] >= max)) {
				maxCode = range;
			}
		}

		for (var k = minCode; k <= maxCode; k++) { selectedCodes.push(+k); }

		return selectedCodes;
	}

	selected.ageSlider = sliderSelections("age");
	selected.incomeSlider = sliderSelections("income");

	/*
	var filterCodes = [];
	var minAge = $("#sliderAge").slider("values", 0);
	var maxAge = $("#sliderAge").slider("values", 1);
	var minAgeCode = 1;
	var maxAgeCode = 7;
	var filteredAgeCodes = [];
	for (var code in codeBook["AGECAT"]["code"]) { ageCodes.push(codeBook["AGECAT"]["code"][code]); }
	for (var j = 0; j < ageCodes.length; j++) {
		if ((ageCodes[j][0] <= minAge) && (ageCodes[j][1] >= minAge)) {
			minAgeCode = j+1;
			break;
		}
	}
	for (j; j < ageCodes.length; j++) {
		if ((ageCodes[j][0] <= maxAge) && (ageCodes[j][1] >= maxAge)) {
			maxAgeCode = j+1;
			break;
		}
	}
	for (var k = minAgeCode; k <= maxAgeCode; k++) {
		filteredAgeCodes.push(k);
	}
	checked.ageSlider = filteredAgeCodes;
	*/

	console.log(selected);


	// Update visualizations
	racialComparison.onSelectionChange(selected);
}

function mentalHealthToggleChanged() {
	var mentalHealthToggleSelection = +$("input[name='mentalHealthButtonOption']:checked").val();

	if (mentalHealthToggleSelection == 1) {
		$("#mhrow2").hide();
		selectionChanged();
	} else {
		$("#mhrow2").show();
	}
}


function intervene (value) {

	suicideChart.onSelectionChange(value);
}

function reset () {

	suicideChart.reset();
}


