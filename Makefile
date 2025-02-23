PIPENV := pipenv run
PYTHON := python -W ignore -m

serve:
	@rm -rf docs/_build
	@cd docs && $(PIPENV) make livehtml

.PHONY: serve