{%- macro input(type, item) %}
    {%-if item.element === 'select' %}
        <label for="{{item.name}}">{{item.label}}</label>
    <select id="{{identity + '_' + item.name}}" name="{{item.name}}" {%if item.relType%}data-rel="{{item.relType}}"{%endif%}>
            {%- for option in item.options -%}
                <option value="{{option}}">{{option|title}}</option>
            {% endfor %}
        </select>
    {%-elseif item.element === "input" %}
            <label for="{{item.name}}">{{item.label}}</label>
            <input type="{{item.type}}" name="{{item.name}}" {%if item.required%}required{%endif%} {%if item.pattern%}pattern="{{item.pattern}}"{%endif%} id="{{identity + '_' + item.name}}" placeholder="{{item.label}}" value="<%= record.{{item.name}} ? record.{{item.name}} : {{item.default}}%>"/>
    {% else %}
            TDB {{type}}
    {% endif %}

{%- endmacro %}

{%- macro button(type, label) %}
        <button type="{{ type|default("submit") }}">{{ label|default("Submit") }}</button>
{%- endmacro %}
