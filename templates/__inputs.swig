{% macro input(type, item, loop) %}
    {%-if item.enum %}
        <select>
            <option>A</option>
            <option>B</option>
        </select>
    {%-elseif type === "string" %}
            <label for="{{loop.key }}">{{ item.title }}</label>
            <input type="text" name="{{loop.key}}"
                {%if item.required%}required{%endif%}
                id="{{loop.key}}" placeholder="{{item.title}}"
                value="<%= record.{{loop.key}} %>"/>
    {% else %}
            TDB {{type}}
    {% endif %}

{% endmacro %}

{% macro button type label %}
<button type="{{ type|default("submit") }}">{{ label|default("Submit") }}</button>
{% endmacro %}
