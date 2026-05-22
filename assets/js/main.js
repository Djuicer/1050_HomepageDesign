/*
	Stellar by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$main = $('#main');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Nav.
		var $nav = $('#nav');

		if ($nav.length > 0) {

			// Shrink effect.
				$main
					.scrollex({
						mode: 'top',
						enter: function() {
							$nav.addClass('alt');
						},
						leave: function() {
							$nav.removeClass('alt');
						},
					});

			// Links.
				var $nav_a = $nav.find('a');

				$nav_a
					.scrolly({
						speed: 1000,
						offset: function() { return $nav.height(); }
					})
					.on('click', function() {

						var $this = $(this);

						// External link? Bail.
							if ($this.attr('href').charAt(0) != '#')
								return;

						// Deactivate all links.
							$nav_a
								.removeClass('active')
								.removeClass('active-locked');

						// Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
							$this
								.addClass('active')
								.addClass('active-locked');

					})
					.each(function() {

						var	$this = $(this),
							id = $this.attr('href'),
							$section = $(id);

						// No section for this link? Bail.
							if ($section.length < 1)
								return;

						// Scrollex.
							$section.scrollex({
								mode: 'middle',
								initialize: function() {

									// Deactivate section.
										if (browser.canUse('transition'))
											$section.addClass('inactive');

								},
								enter: function() {

									// Activate section.
										$section.removeClass('inactive');

									// No locked links? Deactivate all links and activate this section's one.
										if ($nav_a.filter('.active-locked').length == 0) {

											$nav_a.removeClass('active');
											$this.addClass('active');

										}

									// Otherwise, if this section's link is the one that's locked, unlock it.
										else if ($this.hasClass('active-locked'))
											$this.removeClass('active-locked');

								}
							});

					});

		}


	// Nav member CTA reveal.
		var heroMemberCta = document.getElementById('hero-member-cta');
		if (heroMemberCta) {
			var updateMemberNavState = function() {
				var rect = heroMemberCta.getBoundingClientRect();
				var visible = rect.bottom > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight);
				document.body.classList.toggle('show-member-cta', !visible);
			};

			if ('IntersectionObserver' in window) {
				var heroObserver = new IntersectionObserver(function(entries) {
					entries.forEach(function(entry) {
						document.body.classList.toggle('show-member-cta', !entry.isIntersecting);
					});
				}, { threshold: 0.1 });
				heroObserver.observe(heroMemberCta);
			}
			else {
				window.addEventListener('scroll', updateMemberNavState, { passive: true });
				window.addEventListener('resize', updateMemberNavState);
				updateMemberNavState();
			}
		}

	// Member Hub search filter.
		var memberSearchInput = document.getElementById('member-search');
		var memberSearchEmpty = document.getElementById('member-search-empty');
		var memberCards = Array.prototype.slice.call(document.querySelectorAll('.member-features li'));
		if (memberSearchInput && memberCards.length) {
			memberSearchInput.addEventListener('input', function() {
				var term = memberSearchInput.value.trim().toLowerCase();
				var visibleCount = 0;
				memberCards.forEach(function(card) {
					var searchable = (card.getAttribute('data-search') || '') + ' ' + card.textContent;
					var matches = searchable.toLowerCase().indexOf(term) !== -1;
					card.hidden = !matches;
					if (matches) visibleCount++;
				});
				if (memberSearchEmpty)
					memberSearchEmpty.hidden = visibleCount !== 0;
			});
		}

	// Team & Representatives interactions.
		var committeeModal = document.getElementById('committee-chart-modal');
		var openCommitteeButton = document.getElementById('view-committee-chart');
		var closeCommitteeButton = document.getElementById('close-committee-chart');
		var repTabs = Array.prototype.slice.call(document.querySelectorAll('.rep-tab'));
		var repPanels = Array.prototype.slice.call(document.querySelectorAll('.rep-panel'));
		var repPanelsWrap = document.querySelector('.rep-panels-wrap');
		var lastFocusedElement = null;

		if (openCommitteeButton && committeeModal) {
			openCommitteeButton.addEventListener('click', function() {
				lastFocusedElement = document.activeElement;
				if (typeof committeeModal.showModal === 'function') {
					committeeModal.showModal();
					if (closeCommitteeButton)
						closeCommitteeButton.focus();
				}
				else {
					committeeModal.setAttribute('open', 'open');
					if (closeCommitteeButton)
						closeCommitteeButton.focus();
				}
			});

			var closeCommitteeModal = function() {
				if (committeeModal.open && typeof committeeModal.close === 'function')
					committeeModal.close();
				else
					committeeModal.removeAttribute('open');
				if (lastFocusedElement)
					lastFocusedElement.focus();
				else
					openCommitteeButton.focus();
			};

			if (closeCommitteeButton)
				closeCommitteeButton.addEventListener('click', closeCommitteeModal);

			committeeModal.addEventListener('click', function(event) {
				var rect = committeeModal.getBoundingClientRect();
				var clickedBackdrop = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
				if (clickedBackdrop)
					closeCommitteeModal();
			});

			committeeModal.addEventListener('cancel', function(event) {
				event.preventDefault();
				closeCommitteeModal();
			});
		}

		if (repTabs.length && repPanels.length && repPanelsWrap) {
			var activeTabIndex = repTabs.findIndex(function(tab) { return tab.getAttribute('aria-selected') === 'true'; });
			if (activeTabIndex < 0) activeTabIndex = 0;
			var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			var isAnimating = false;
			var getPanelHeight = function(panel) {
				var previousHidden = panel.hidden;
				if (previousHidden) panel.hidden = false;
				var height = panel.offsetHeight;
				if (previousHidden) panel.hidden = true;
				return height;
			};
			var syncPanelsWrapHeight = function(panel) {
				repPanelsWrap.style.minHeight = getPanelHeight(panel) + 'px';
			};
			var setActiveTabState = function(nextIndex) {
				repTabs.forEach(function(otherTab, index) {
					var isActive = index === nextIndex;
					otherTab.classList.toggle('is-active', isActive);
					otherTab.setAttribute('aria-selected', isActive ? 'true' : 'false');
					otherTab.setAttribute('tabindex', isActive ? '0' : '-1');
				});
			};
			var activateTab = function(nextIndex) {
				if (isAnimating || nextIndex === activeTabIndex) return;
				var currentTab = repTabs[activeTabIndex];
				var nextTab = repTabs[nextIndex];
				var currentPanel = document.getElementById(currentTab.getAttribute('aria-controls'));
				var nextPanel = document.getElementById(nextTab.getAttribute('aria-controls'));
				if (!currentPanel || !nextPanel) return;
				var movingRight = nextIndex > activeTabIndex;
				var directionClass = movingRight ? 'slide-left' : 'slide-right';
				setActiveTabState(nextIndex);
				syncPanelsWrapHeight(currentPanel);
				if (reduceMotionQuery.matches) {
					currentPanel.hidden = true;
					currentPanel.setAttribute('aria-hidden', 'true');
					currentPanel.classList.remove('is-active');
					nextPanel.hidden = false;
					nextPanel.removeAttribute('aria-hidden');
					nextPanel.classList.add('is-active');
					activeTabIndex = nextIndex;
					syncPanelsWrapHeight(nextPanel);
					return;
				}
				isAnimating = true;
				repPanelsWrap.classList.add('is-animating');
				repPanelsWrap.style.minHeight = Math.max(getPanelHeight(currentPanel), getPanelHeight(nextPanel)) + 'px';
				nextPanel.hidden = false;
				nextPanel.removeAttribute('aria-hidden');
				nextPanel.classList.add('is-active', 'is-entering', directionClass);
				currentPanel.classList.add('is-leaving', directionClass);
				window.requestAnimationFrame(function() {
					nextPanel.classList.add('is-visible');
					currentPanel.classList.add('is-hidden');
				});
				window.setTimeout(function() {
					currentPanel.hidden = true;
					currentPanel.setAttribute('aria-hidden', 'true');
					currentPanel.classList.remove('is-active', 'is-leaving', 'slide-left', 'slide-right', 'is-hidden');
					nextPanel.classList.remove('is-entering', 'slide-left', 'slide-right', 'is-visible');
					activeTabIndex = nextIndex;
					repPanelsWrap.classList.remove('is-animating');
					syncPanelsWrapHeight(nextPanel);
					isAnimating = false;
				}, 280);
			};
			syncPanelsWrapHeight(repPanels[activeTabIndex]);
			window.addEventListener('resize', function() {
				if (isAnimating) return;
				var activePanel = document.getElementById(repTabs[activeTabIndex].getAttribute('aria-controls'));
				if (activePanel) syncPanelsWrapHeight(activePanel);
			});
			repTabs.forEach(function(tab, index) {
				tab.addEventListener('click', function() { activateTab(index); });
				tab.addEventListener('keydown', function(event) {
					var targetIndex = index;
					var shouldActivate = false;
					if (event.key === 'ArrowRight') targetIndex = (index + 1) % repTabs.length;
					else if (event.key === 'ArrowLeft') targetIndex = (index - 1 + repTabs.length) % repTabs.length;
					else if (event.key === 'Home') targetIndex = 0;
					else if (event.key === 'End') targetIndex = repTabs.length - 1;
					else if (event.key === 'Enter' || event.key === ' ') { shouldActivate = true; }
					else return;
					event.preventDefault();
					if (shouldActivate) {
						activateTab(index);
						return;
					}
					repTabs[targetIndex].focus();
					activateTab(targetIndex);
				});
			});
		}

	// Scrolly.
		$('.scrolly').scrolly({
			speed: 1000
		});

})(jQuery);
